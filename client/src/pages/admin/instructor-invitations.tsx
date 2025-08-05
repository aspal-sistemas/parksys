import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, Clock, CheckCircle, XCircle, Plus, Calendar } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface InstructorInvitation {
  id: number;
  email: string;
  status: 'pending' | 'used' | 'expired';
  invitedAt: string;
  expiresAt: string;
  usedAt?: string;
  invitedByName?: string;
}

export default function InstructorInvitations() {
  const [email, setEmail] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Obtener lista de invitaciones
  const { data: invitations = [], isLoading } = useQuery<InstructorInvitation[]>({
    queryKey: ['/api/instructor-invitations'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/instructor-invitations');
      if (!response.ok) {
        throw new Error('Error al obtener invitaciones');
      }
      return response.json();
    }
  });

  // Mutación para crear invitación
  const createInvitationMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await apiRequest('POST', '/api/instructor-invitations', { email });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear invitación');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Invitación enviada",
        description: "La invitación ha sido enviada exitosamente por email",
      });
      setEmail("");
      setIsCreating(false);
      queryClient.invalidateQueries({ queryKey: ['/api/instructor-invitations'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleCreateInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa un email válido",
        variant: "destructive",
      });
      return;
    }
    createInvitationMutation.mutate(email.trim());
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-orange-600 border-orange-200"><Clock className="w-3 h-3 mr-1" />Pendiente</Badge>;
      case 'used':
        return <Badge variant="outline" className="text-green-600 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Utilizada</Badge>;
      case 'expired':
        return <Badge variant="outline" className="text-red-600 border-red-200"><XCircle className="w-3 h-3 mr-1" />Expirada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { 
      addSuffix: true, 
      locale: es 
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invitaciones de Instructores</h1>
          <p className="text-gray-600 mt-2">
            Gestiona las invitaciones para que nuevos instructores se registren en la plataforma
          </p>
        </div>
      </div>

      {/* Formulario para nueva invitación */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Nueva Invitación
          </CardTitle>
          <CardDescription>
            Invita a un nuevo instructor enviando una invitación por email
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isCreating ? (
            <Button onClick={() => setIsCreating(true)} className="w-full">
              <Mail className="w-4 h-4 mr-2" />
              Crear Nueva Invitación
            </Button>
          ) : (
            <form onSubmit={handleCreateInvitation} className="space-y-4">
              <div>
                <Label htmlFor="email">Email del Instructor</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="instructor@ejemplo.com"
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  disabled={createInvitationMutation.isPending}
                  className="flex-1"
                >
                  {createInvitationMutation.isPending ? "Enviando..." : "Enviar Invitación"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsCreating(false);
                    setEmail("");
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Lista de invitaciones */}
      <div className="grid gap-4">
        {invitations.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No hay invitaciones registradas</p>
              <p className="text-sm text-gray-400 mt-2">
                Crea tu primera invitación para comenzar
              </p>
            </CardContent>
          </Card>
        ) : (
          invitations.map((invitation) => (
            <Card key={invitation.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{invitation.email}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Enviada {formatDate(invitation.invitedAt)}
                        </span>
                        {invitation.invitedByName && (
                          <span>por {invitation.invitedByName}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(invitation.status)}
                    <div className="text-xs text-gray-500 mt-1">
                      {invitation.status === 'pending' && (
                        <>Expira {formatDate(invitation.expiresAt)}</>
                      )}
                      {invitation.status === 'used' && invitation.usedAt && (
                        <>Utilizada {formatDate(invitation.usedAt)}</>
                      )}
                      {invitation.status === 'expired' && (
                        <>Expiró {formatDate(invitation.expiresAt)}</>
                      )}
                    </div>
                  </div>
                </div>
                
                {invitation.status === 'pending' && (
                  <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-sm text-orange-800">
                      <strong>Invitación pendiente:</strong> El instructor debe completar su registro 
                      antes de que expire la invitación.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}