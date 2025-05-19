import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, FileText, MessageSquare, Video } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ParkQuickActionsProps {
  parkId: number;
  parkName: string;
  videoUrl?: string | null;
  regulationUrl?: string | null;
  activities?: any[];
}

export const ParkQuickActions: React.FC<ParkQuickActionsProps> = ({
  parkId,
  parkName,
  videoUrl,
  regulationUrl,
  activities
}) => {
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
  const [isActivitiesDialogOpen, setIsActivitiesDialogOpen] = useState(false);
  const [commentFormData, setCommentFormData] = useState({
    text: "",
    name: "",
    email: ""
  });

  // Formato para fechas
  const formatDate = (date: Date) => {
    return format(new Date(date), "EEEE, d 'de' MMMM 'de' yyyy • h:mm a", { locale: es });
  };

  // Manejar envío de comentario
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!commentFormData.text.trim()) {
      alert("Por favor ingresa un comentario");
      return;
    }
    
    try {
      const response = await fetch(`/api/parks/${parkId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: commentFormData.text,
          name: commentFormData.name || "Anónimo",
          email: commentFormData.email || undefined
        })
      });
      
      if (response.ok) {
        alert("¡Gracias por tu comentario! Será revisado por un administrador.");
        setCommentFormData({ text: "", name: "", email: "" });
        setIsCommentDialogOpen(false);
      } else {
        alert("Hubo un error al enviar tu comentario. Por favor intenta nuevamente.");
      }
    } catch (error) {
      console.error("Error al enviar comentario:", error);
      alert("No se pudo enviar el comentario debido a un error de conexión.");
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    const field = id.replace('comment-', '');
    setCommentFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <>
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
                onClick={() => window.open(videoUrl, '_blank')}
              >
                <Video className="h-4 w-4 mr-2" />
                Ver video del parque
              </Button>
            )}
            
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => regulationUrl ? window.open(regulationUrl, '_blank') : alert('El reglamento no está disponible para este parque.')}
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
      </div>
      
      {/* Diálogo de actividades */}
      <Dialog open={isActivitiesDialogOpen} onOpenChange={setIsActivitiesDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Próximas Actividades en {parkName}</DialogTitle>
            <DialogDescription>
              Calendario de eventos y actividades programadas
            </DialogDescription>
          </DialogHeader>
          
          {activities && activities.length > 0 ? (
            <div className="space-y-4 my-4">
              {activities.map((activity: any) => (
                <div 
                  key={activity.id} 
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{activity.title}</h3>
                    {activity.category && (
                      <Badge className="bg-secondary-100 text-secondary-800">
                        {activity.category}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {formatDate(activity.startDate)}
                  </p>
                  <p className="text-gray-700">{activity.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-gray-50 rounded-lg my-4">
              <p className="text-gray-500">No hay actividades programadas actualmente.</p>
            </div>
          )}
          
          <div className="flex justify-end">
            <Button
              onClick={() => setIsActivitiesDialogOpen(false)}
            >
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo de comentarios */}
      <Dialog open={isCommentDialogOpen} onOpenChange={setIsCommentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Deja tu comentario sobre {parkName}</DialogTitle>
            <DialogDescription>
              Tu opinión nos ayuda a mejorar los espacios públicos
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleCommentSubmit} className="space-y-4 my-4">
            <div className="space-y-2">
              <label htmlFor="comment-name" className="text-sm font-medium">Nombre (opcional)</label>
              <input 
                id="comment-name"
                type="text" 
                value={commentFormData.name} 
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Tu nombre"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="comment-email" className="text-sm font-medium">Email (opcional)</label>
              <input 
                id="comment-email"
                type="email" 
                value={commentFormData.email} 
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="tu@email.com"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="comment-text" className="text-sm font-medium">Comentario *</label>
              <textarea 
                id="comment-text"
                value={commentFormData.text} 
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 min-h-[100px]"
                placeholder="Comparte tu experiencia o sugerencias para este parque"
                required
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsCommentDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                Enviar comentario
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ParkQuickActions;