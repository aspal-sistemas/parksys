import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Calendar, Video, FileText, MessageSquare, Loader } from 'lucide-react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isActivitiesDialogOpen, setIsActivitiesDialogOpen] = useState(false);
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
  const [isCommentsListOpen, setIsCommentsListOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [commentName, setCommentName] = useState("");
  const [commentEmail, setCommentEmail] = useState("");
  
  // Consultar comentarios existentes
  const { data: comments, isLoading: isLoadingComments } = useQuery({
    queryKey: [`/api/parks/${parkId}/comments`],
    queryFn: async () => {
      const response = await fetch(`/api/parks/${parkId}/comments?approvedOnly=true`);
      if (!response.ok) {
        throw new Error('Error al cargar comentarios');
      }
      return response.json();
    },
    enabled: isCommentsListOpen, // Solo cargar cuando se abra el diálogo
  });
  
  // Formatear fecha
  const formatDate = (date: string | Date) => {
    return format(new Date(date), "d 'de' MMMM 'de' yyyy, HH:mm", {
      locale: es
    });
  };
  
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const endpoint = `/api/parks/${parkId}/comments`;
      const data = {
        name: commentName,
        email: commentEmail,
        content: comment,  // Cambiado de 'comment' a 'content' según el esquema
      };
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
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
      } else {
        throw new Error('Error al enviar el comentario');
      }
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
        
        <div className="grid grid-cols-2 gap-3">
          {videoUrl && (
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              onClick={() => window.open(videoUrl, '_blank')}
            >
              <Video className="h-4 w-4 mr-2" />
              Ver video
            </Button>
          )}
          
          {regulationUrl && (
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              onClick={() => window.open(regulationUrl, '_blank')}
            >
              <FileText className="h-4 w-4 mr-2" />
              Reglamento
            </Button>
          )}
          
          {activities && activities.length > 0 && (
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setIsActivitiesDialogOpen(true)}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Actividades
            </Button>
          )}
          
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => setIsCommentsListOpen(true)}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Comentarios
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
            <div className="space-y-4">
              {activities && activities.length > 0 ? (
                activities.map((activity: any) => (
                  <div key={activity.id} className="border rounded-lg p-3">
                    <h4 className="font-medium text-lg">{activity.name || activity.title}</h4>
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
                ))
              ) : (
                <div className="text-center py-6">
                  <p>No hay actividades programadas para este parque.</p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Comments List Dialog */}
      <Dialog open={isCommentsListOpen} onOpenChange={setIsCommentsListOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Comentarios sobre {parkName}</DialogTitle>
            <DialogDescription>
              Opiniones y experiencias de visitantes
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-2">
            {isLoadingComments ? (
              <div className="flex justify-center items-center py-10">
                <Loader className="h-8 w-8 text-primary animate-spin" />
              </div>
            ) : (
              <>
                {comments && comments.length > 0 ? (
                  <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                    {comments.map((comment: any) => (
                      <div key={comment.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between mb-2">
                          <h4 className="font-medium">{comment.name}</h4>
                          <span className="text-xs text-gray-500">
                            {comment.createdAt && formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-gray-700">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500 mb-4">No hay comentarios aún para este parque.</p>
                  </div>
                )}
                
                <div className="mt-6 pt-4 border-t">
                  <Button 
                    className="w-full" 
                    onClick={() => {
                      setIsCommentsListOpen(false);
                      setTimeout(() => setIsCommentDialogOpen(true), 100);
                    }}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Dejar un nuevo comentario
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* New Comment Dialog */}
      <Dialog open={isCommentDialogOpen} onOpenChange={setIsCommentDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Dejar un comentario</DialogTitle>
            <DialogDescription>
              Comparte tu experiencia en {parkName}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleCommentSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="comment-name">Tu nombre</Label>
              <Input 
                id="comment-name"
                value={commentName}
                onChange={(e) => setCommentName(e.target.value)}
                placeholder="Ingresa tu nombre"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="comment-email">Correo electrónico</Label>
              <Input 
                id="comment-email"
                type="email"
                value={commentEmail}
                onChange={(e) => setCommentEmail(e.target.value)}
                placeholder="Ingresa tu correo electrónico"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="comment-text">Comentario</Label>
              <Textarea 
                id="comment-text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Escribe tu comentario o experiencia en el parque"
                rows={4}
                required
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="ghost"
                onClick={() => setIsCommentDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">Enviar comentario</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ParkQuickActions;