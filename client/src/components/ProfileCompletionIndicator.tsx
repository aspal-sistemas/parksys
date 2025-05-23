import React from 'react';
import { useProfileCompletion, CompletionLevel } from './ProfileCompletionContext';
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle, InfoIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface ProfileCompletionIndicatorProps {
  userData: any;
  role: string;
  additionalData?: any;
  showDetails?: boolean;
}

export const ProfileCompletionIndicator: React.FC<ProfileCompletionIndicatorProps> = ({
  userData,
  role,
  additionalData,
  showDetails = false
}) => {
  const { getProfileCompletionState, getLevelColor, getLevelDescription } = useProfileCompletion();
  
  if (!userData || !role) {
    return null;
  }
  
  const completionState = getProfileCompletionState(userData, role, additionalData);
  const { level, percentage, missingFields } = completionState;
  
  // Determinamos el icono según el nivel
  const getLevelIcon = () => {
    switch (level) {
      case CompletionLevel.COMPLETE:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case CompletionLevel.INTERMEDIATE:
        return <InfoIcon className="h-5 w-5 text-blue-500" />;
      case CompletionLevel.BASIC:
        return <InfoIcon className="h-5 w-5 text-yellow-500" />;
      case CompletionLevel.INCOMPLETE:
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <InfoIcon className="h-5 w-5 text-gray-500" />;
    }
  };
  
  // Traducción del nivel a español
  const getLevelName = () => {
    switch (level) {
      case CompletionLevel.COMPLETE:
        return "Completo";
      case CompletionLevel.INTERMEDIATE:
        return "Intermedio";
      case CompletionLevel.BASIC:
        return "Básico";
      case CompletionLevel.INCOMPLETE:
        return "Incompleto";
      default:
        return "Desconocido";
    }
  };
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getLevelIcon()}
          <span className="font-medium">Perfil {getLevelName()}</span>
          <Badge variant={level === CompletionLevel.COMPLETE ? "default" : "outline"} 
                 className={`ml-2 ${getLevelColor(level)}`}>
            {percentage}%
          </Badge>
        </div>
        
        {missingFields.length > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center text-sm text-muted-foreground cursor-pointer">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  <span>{missingFields.length} {missingFields.length === 1 ? 'campo' : 'campos'} faltante{missingFields.length !== 1 ? 's' : ''}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <div className="p-1">
                  <p className="font-medium mb-1">Campos requeridos faltantes:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    {missingFields.map((field, index) => (
                      <li key={index} className="text-sm">{field.label}</li>
                    ))}
                  </ul>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      
      <Progress value={percentage} className="h-2" />
      
      {showDetails && missingFields.length > 0 && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Información requerida faltante</AlertTitle>
          <AlertDescription>
            <p className="mb-2">{getLevelDescription(level)}</p>
            <ul className="list-disc pl-5 space-y-1">
              {missingFields.map((field, index) => (
                <li key={index} className="text-sm">
                  <span className="font-medium">{field.label}</span>: {field.description}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ProfileCompletionIndicator;