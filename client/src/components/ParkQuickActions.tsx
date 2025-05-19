import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, Video, FileText, MessageSquare } from 'lucide-react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface ParkQuickActionsProps {
  parkId: number;
  parkName: string;
  videoUrl?: string | null;
  regulationUrl?: string | null;
  activities?: any[];
}

const ParkQuickActions: React.FC<ParkQuickActionsProps> = ({
  parkId,
  parkName,
  videoUrl,
  regulationUrl,
  activities = []
}) => {
  const [isActivitiesDialogOpen, setIsActivitiesDialogOpen] = useState(false);
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [commentName, setCommentName] = useState("");
  const [commentEmail, setCommentEmail] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch park activities
  const { data: parkActivities = [] } = useQuery({
    queryKey: [`/api/parks/${parkId}/activities`],
    enabled: isActivitiesDialogOpen,
    placeholderData: []
  });

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const endpoint = `/api/parks/${parkId}/comments`;
      const data = {
        name: commentName,
        email: commentEmail,
        comment: comment,
      };
      
      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      toast({
        title: "Comentario enviado",
        description: "Tu comentario ha sido enviado para revisión.",
      });
      
      setComment("");
      setCommentName("");
      setCommentEmail("");
      setIsCommentDialogOpen(false);
      
      // Invalidate the comments query to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/parks/${parkId}/comments`] });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo enviar el comentario. Por favor, intenta nuevamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm mb-6">
      <div className="p-4">
        <h3 className="font-medium text-lg mb-4">Acciones rápidas</h3>
        <div className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => setIsActivitiesDialogOpen(true)}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Ver próximas actividades
          </Button>
          
          {videoUrl && (
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => window.open(String(videoUrl), '_blank')}
            >
              <Video className="h-4 w-4 mr-2" />
              Ver video del parque
            </Button>
          )}
          
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => regulationUrl 
              ? window.open(String(regulationUrl), '_blank') 
              : toast({
                  title: "Reglamento no disponible",
                  description: "El reglamento no está disponible para este parque."
                })
            }
          >
            <FileText className="h-4 w-4 mr-2" />
            Descargar reglamento
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => setIsCommentDialogOpen(true)}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Dejar un comentario
          </Button>
        </div>
      </div>

      {/* Activities Dialog */}
      <Dialog open={isActivitiesDialogOpen} onOpenChange={setIsActivitiesDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Próximas actividades en {parkName}</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            {Array.isArray(parkActivities) && parkActivities.length > 0 ? (
              <div className="space-y-4">
                {parkActivities.map((activity: any) => (
                  <div key={activity.id} className="border rounded-lg p-3">
                    <h4 className="font-medium text-lg">{activity.name}</h4>
                    <p className="text-sm text-gray-500">
                      {formatDate(activity.startDate)} - {formatDate(activity.endDate)}
                    </p>
                    <p className="mt-2">{activity.description}</p>
                    {activity.schedule && (
                      <p className="text-sm mt-1">
                        <span className="font-medium">Horario:</span> {activity.schedule}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p>No hay actividades programadas para este parque.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Comment Dialog */}
      <Dialog open={isCommentDialogOpen} onOpenChange={setIsCommentDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Dejar un comentario sobre {parkName}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCommentSubmit} className="space-y-4 my-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input 
                id="name" 
                value={commentName}
                onChange={(e) => setCommentName(e.target.value)}
                placeholder="Tu nombre" 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input 
                id="email" 
                type="email" 
                value={commentEmail}
                onChange={(e) => setCommentEmail(e.target.value)}
                placeholder="ejemplo@correo.com" 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="comment">Comentario</Label>
              <Textarea 
                id="comment" 
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Escribe tu comentario..." 
                className="h-24"
                required 
              />
            </div>
            <Button type="submit" className="w-full">Enviar comentario</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export { ParkQuickActions };
export default ParkQuickActions;