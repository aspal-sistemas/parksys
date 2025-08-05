import { Incident } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { AlertCircle, AlertTriangle, CheckCircle, CircleAlert, Clock } from "lucide-react";

interface IncidentCardProps {
  incident: Incident;
  parkName?: string;
}

export function IncidentCard({ incident, parkName }: IncidentCardProps) {
  // Función para formatear la fecha
  const formatDate = (date: Date) => {
    return format(new Date(date), "d 'de' MMMM, yyyy", { locale: es });
  };

  // Determinar el icono y color basado en el estado
  const getStatusInfo = () => {
    switch (incident.status) {
      case "pending":
        return {
          icon: <Clock className="h-4 w-4" />,
          label: "Pendiente",
          color: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
        };
      case "in_progress":
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          label: "En proceso",
          color: "bg-blue-100 text-blue-800 hover:bg-blue-100",
        };
      case "resolved":
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          label: "Resuelto",
          color: "bg-green-100 text-green-800 hover:bg-green-100",
        };
      case "urgent":
        return {
          icon: <AlertTriangle className="h-4 w-4" />,
          label: "Urgente",
          color: "bg-red-100 text-red-800 hover:bg-red-100",
        };
      default:
        return {
          icon: <CircleAlert className="h-4 w-4" />,
          label: "Desconocido",
          color: "bg-gray-100 text-gray-800 hover:bg-gray-100",
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base font-medium">
              {incident.reporterName}
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              {formatDate(incident.createdAt)}
            </p>
          </div>
          <Badge className={`flex items-center gap-1 ${statusInfo.color}`}>
            {statusInfo.icon}
            {statusInfo.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm">{incident.description}</p>
        
        {parkName && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Parque: <span className="font-medium">{parkName}</span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}