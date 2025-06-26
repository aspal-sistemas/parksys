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
});

type TreeSpeciesFormValues = z.infer<typeof treeSpeciesSchema>;

function SimpleNewTreeSpecies() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  // Manejar el envío del formulario
  function onSubmit(data: TreeSpeciesFormValues) {
    console.log('Datos del formulario:', data);
    console.log('Errores del formulario:', form.formState.errors);
    createTreeSpeciesMutation.mutate(data);
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-green-800">Nueva Especie Arbórea</h1>
        <p className="text-muted-foreground">
          Registra una nueva especie en el catálogo de árboles.
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
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

            {/* Campos opcionales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL de Imagen (Opcional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://ejemplo.com/imagen.jpg" 
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
  );
}

export default SimpleNewTreeSpecies;