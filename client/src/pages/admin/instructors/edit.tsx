import React, { useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, RefreshCw, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// Interface para los datos del instructor recibidos del backend
interface InstructorData {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  experienceYears: number;
  specialties?: string[] | string;
  bio?: string;
  status?: string;
  profileImageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Schema de validación para el formulario
const instructorEditSchema = z.object({
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  experienceYears: z.number().min(0, 'La experiencia debe ser un número positivo'),
  specialties: z.string().min(1, 'Debe especificar al menos una especialidad'),
  bio: z.string().optional(),
  status: z.enum(['active', 'inactive', 'pending']),
});

type InstructorFormData = z.infer<typeof instructorEditSchema>;

export default function EditInstructorPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Obtener datos del instructor
  const { data: instructor, isLoading, isError } = useQuery<InstructorData>({
    queryKey: [`/api/instructors/${id}`],
    enabled: !!id,
  });

  // Configurar formulario
  const form = useForm<InstructorFormData>({
    resolver: zodResolver(instructorEditSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      experienceYears: 0,
      specialties: '',
      bio: '',
      status: 'active',
    },
  });

  // Llenar formulario cuando se cargan los datos
  useEffect(() => {
    if (instructor && typeof instructor === 'object') {
      const instructorData = instructor as any; // Usar any temporalmente para evitar errores de tipo
      
      form.reset({
        firstName: instructorData.firstName || '',
        lastName: instructorData.lastName || '',
        email: instructorData.email || '',
        phone: instructorData.phone || '',
        experienceYears: instructorData.experienceYears || 0,
        specialties: Array.isArray(instructorData.specialties) 
          ? instructorData.specialties.join(', ') 
          : instructorData.specialties || '',
        bio: instructorData.bio || '',
        status: (instructorData.status as 'active' | 'inactive' | 'pending') || 'active',
      });
    }
  }, [instructor, form]);

  // Mutación para actualizar instructor
  const updateInstructorMutation = useMutation({
    mutationFn: async (data: InstructorFormData) => {
      const updateData = {
        ...data,
        specialties: data.specialties.split(',').map(s => s.trim()).filter(s => s.length > 0),
      };
      
      return await apiRequest(`/api/instructors/${id}`, {
        method: 'PUT',
        data: updateData,
      });
    },
    onSuccess: () => {
      toast({
        title: "Instructor actualizado",
        description: "La información del instructor se ha actualizado correctamente.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/instructors'] });
      queryClient.invalidateQueries({ queryKey: [`/api/instructors/${id}`] });
      setLocation('/admin/instructors');
    },
    onError: (error: any) => {
      toast({
        title: "Error al actualizar",
        description: error.message || "Ocurrió un error al actualizar el instructor.",
        variant: "destructive",
      });
    },
  });

  // Manejar envío del formulario
  const onSubmit = (data: InstructorFormData) => {
    updateInstructorMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="container mx-auto p-6">
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
            <p className="mt-2 text-gray-500">Cargando datos del instructor...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (isError || !instructor) {
    return (
      <AdminLayout>
        <div className="container mx-auto p-6">
          <div className="text-center py-8">
            <AlertCircle className="h-8 w-8 mx-auto text-red-500" />
            <p className="mt-2 text-red-500">Error al cargar el instructor</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => setLocation('/admin/instructors')}>
              Volver a la lista
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto p-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => setLocation('/admin/instructors')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Editar Instructor</h1>
              <p className="text-muted-foreground">
                Actualiza la información del instructor {(instructor as any)?.firstName} {(instructor as any)?.lastName}
              </p>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Instructor</CardTitle>
            <CardDescription>
              Modifica los datos del instructor. Los campos marcados con * son obligatorios.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Información Personal */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre *</FormLabel>
                        <FormControl>
                          <Input placeholder="Nombre del instructor" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Apellido *</FormLabel>
                        <FormControl>
                          <Input placeholder="Apellido del instructor" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Información de Contacto */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="instructor@email.com" {...field} />
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
                          <Input placeholder="(33) 1234-5678" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Experiencia y Estado */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="experienceYears"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Años de Experiencia *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            placeholder="0" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
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
                        <FormLabel>Estado *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar estado" />
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
                </div>

                {/* Especialidades */}
                <FormField
                  control={form.control}
                  name="specialties"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Especialidades *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Yoga, Danza, Deportes (separadas por comas)" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Biografía */}
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Biografía</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Información adicional sobre el instructor..."
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Botones */}
                <div className="flex gap-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLocation('/admin/instructors')}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={updateInstructorMutation.isPending}
                    className="bg-[#00a587] hover:bg-[#067f5f]"
                  >
                    {updateInstructorMutation.isPending ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Guardar Cambios
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}