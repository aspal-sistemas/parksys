import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { insertIncidentSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle } from "lucide-react";

// Extendemos el esquema de inserción con validación adicional
const incidentFormSchema = insertIncidentSchema.extend({
  reporterName: z.string().min(3, {
    message: "El nombre debe tener al menos 3 caracteres",
  }),
  reporterEmail: z
    .string()
    .email({ message: "Por favor ingrese un correo electrónico válido" })
    .optional()
    .nullable(),
  reporterPhone: z
    .string()
    .regex(/^[0-9]{10}$/, {
      message: "Por favor ingrese un número de teléfono de 10 dígitos",
    })
    .optional()
    .nullable(),
  description: z.string().min(10, {
    message: "La descripción debe tener al menos 10 caracteres",
  }),
});

type IncidentFormValues = z.infer<typeof incidentFormSchema>;

interface IncidentReportFormProps {
  parkId: number;
  parkName: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function IncidentReportForm({
  parkId,
  parkName,
  onSuccess,
  onCancel,
}: IncidentReportFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const defaultValues: Partial<IncidentFormValues> = {
    parkId,
    reporterName: "",
    reporterEmail: "",
    reporterPhone: "",
    description: "",
  };

  const form = useForm<IncidentFormValues>({
    resolver: zodResolver(incidentFormSchema),
    defaultValues,
  });

  const mutation = useMutation({
    mutationFn: (values: IncidentFormValues) => {
      return apiRequest("POST", `/api/parks/${parkId}/incidents`, values);
    },
    onSuccess: () => {
      toast({
        title: "Incidente reportado",
        description: "Gracias por informar este problema. Lo revisaremos pronto.",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: [`/api/parks/${parkId}/incidents`] });
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      console.error("Error reporting incident:", error);
      toast({
        title: "Error",
        description: "No se pudo enviar el reporte. Por favor intente nuevamente.",
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: IncidentFormValues) {
    mutation.mutate(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="reporterName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre *</FormLabel>
                <FormControl>
                  <Input placeholder="Su nombre" {...field} />
                </FormControl>
                <FormDescription>
                  El nombre de la persona que reporta el incidente
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="reporterEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo electrónico</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="correo@ejemplo.com" 
                      value={field.value || ''} 
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      disabled={field.disabled}
                      name={field.name}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormDescription>
                    Para dar seguimiento a su reporte (opcional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reporterPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="10 dígitos" 
                      value={field.value || ''} 
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      disabled={field.disabled}
                      name={field.name}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormDescription>
                    Número de contacto (opcional)
                  </FormDescription>
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
                <FormLabel>Descripción del problema *</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describa el problema que observó en el parque..."
                    className="resize-none h-32"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Sea lo más específico posible sobre la ubicación y el tipo de problema
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="bg-amber-50 border border-amber-200 p-3 rounded-md flex items-start">
            <AlertCircle className="text-amber-500 h-5 w-5 mr-2 mt-0.5" />
            <div className="text-sm text-amber-700">
              <p className="font-medium">Reportando para: {parkName}</p>
              <p>Su reporte será revisado por el administrador del parque.</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Enviando..." : "Enviar reporte"}
          </Button>
        </div>
      </form>
    </Form>
  );
}