import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Spinner } from '@/components/Spinner';

// Esquema de validación para el formulario
const instructorFormSchema = z.object({
  full_name: z.string().min(3, {
    message: 'El nombre debe tener al menos 3 caracteres',
  }),
  email: z.string().email({
    message: 'Por favor ingrese un correo electrónico válido',
  }),
  phone: z.string().optional(),
  specialties: z.string().optional(),
  experience_years: z.coerce.number().min(0).max(50),
  biography: z.string().optional(),
  address: z.string().optional(),
  status: z.string(),
});

type FormValues = z.infer<typeof instructorFormSchema>;

interface InstructorEditDialogProps {
  instructorId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function InstructorEditDialog({
  instructorId,
  open,
  onOpenChange
}: InstructorEditDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Consulta para obtener los datos del instructor
  const { data: instructor, isLoading } = useQuery({
    queryKey: [`/api/instructors/${instructorId}`],
    enabled: open && !!instructorId,
  });

  // Configurar formulario
  const form = useForm<FormValues>({
    resolver: zodResolver(instructorFormSchema),
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
      specialties: '',
      experience_years: 0,
      biography: '',
      address: '',
      status: 'active',
    },
  });

  // Cargar datos del instructor cuando estén disponibles
  React.useEffect(() => {
    if (instructor) {
      form.reset({
        full_name: instructor.full_name || '',
        email: instructor.email || '',
        phone: instructor.phone || '',
        specialties: instructor.specialties || '',
        experience_years: instructor.experience_years || 0,
        biography: instructor.biography || '',
        address: instructor.address || '',
        status: instructor.status || 'active',
      });
    }
  }, [instructor, form]);

  // Mutación para actualizar instructor
  const updateMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const response = await fetch(`/api/instructors/${instructorId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar instructor');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      // Invalidar consultas para actualizar la UI
      queryClient.invalidateQueries({ queryKey: ['/api/instructors'] });
      queryClient.invalidateQueries({ queryKey: [`/api/instructors/${instructorId}`] });
      
      // Mostrar notificación de éxito
      toast({
        title: 'Instructor actualizado',
        description: 'Los datos del instructor se han actualizado correctamente.',
      });
      
      // Cerrar el diálogo
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Hubo un problema al actualizar el instructor',
        variant: 'destructive',
      });
    },
  });

  // Manejar envío del formulario
  const onSubmit = (values: FormValues) => {
    updateMutation.mutate(values);
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <div className="flex items-center justify-center h-40">
            <Spinner size="lg" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Instructor</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="general">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="general">Información General</TabsTrigger>
                <TabsTrigger value="additional">Información Adicional</TabsTrigger>
              </TabsList>
              
              {/* Pestaña de Información General */}
              <TabsContent value="general" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre completo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo electrónico</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="correo@ejemplo.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono</FormLabel>
                      <FormControl>
                        <Input placeholder="Teléfono de contacto" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione un estado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Activo</SelectItem>
                          <SelectItem value="inactive">Inactivo</SelectItem>
                          <SelectItem value="pending">Pendiente</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              {/* Pestaña de Información Adicional */}
              <TabsContent value="additional" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="specialties"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Especialidades</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Yoga, Pilates, Meditación, etc. Separadas por comas" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Ingrese las especialidades separadas por comas.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="experience_years"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Años de experiencia</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          max="50" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="biography"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Biografía</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Breve biografía del instructor" 
                          className="min-h-[120px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
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
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={updateMutation.isPending}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Guardando...
                  </>
                ) : (
                  'Guardar cambios'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}