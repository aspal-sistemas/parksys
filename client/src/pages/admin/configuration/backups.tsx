import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { 
  HardDrive, 
  Download, 
  Upload,
  Clock,
  AlertCircle,
  CheckCircle,
  Settings,
  Save,
  Trash2,
  RefreshCw,
  Calendar,
  Database,
  FileText,
  Cloud
} from "lucide-react";

interface BackupItem {
  id: string;
  filename: string;
  size: number;
  createdAt: string;
  type: 'manual' | 'automatic';
  status: 'completed' | 'in_progress' | 'failed';
}

const BackupSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);

  // Configuración de respaldos automáticos
  const [automaticBackups, setAutomaticBackups] = useState({
    enabled: true,
    frequency: 'daily', // daily, weekly, monthly
    time: '02:00',
    retentionDays: 30,
    includeUploads: true,
    includeDatabase: true,
    includeConfigs: true,
  });

  // Datos simulados de respaldos existentes
  const backups: BackupItem[] = [
    {
      id: '1',
      filename: 'backup-20250528-124804.sql.gz',
      size: 45600000, // bytes
      createdAt: '2025-05-28T12:48:04Z',
      type: 'manual',
      status: 'completed'
    },
    {
      id: '2',
      filename: 'backup-20250527-020000.sql.gz',
      size: 43200000,
      createdAt: '2025-05-27T02:00:00Z',
      type: 'automatic',
      status: 'completed'
    },
    {
      id: '3',
      filename: 'backup-20250526-020000.sql.gz',
      size: 42800000,
      createdAt: '2025-05-26T02:00:00Z',
      type: 'automatic',
      status: 'completed'
    }
  ];

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleCreateBackup = async () => {
    setIsCreatingBackup(true);
    setBackupProgress(0);

    try {
      // Simular progreso de respaldo
      const interval = setInterval(() => {
        setBackupProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 200);

      // Simular llamada a la API
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "Respaldo creado",
        description: "El respaldo se ha generado correctamente.",
      });
      
      // Actualizar la lista de respaldos
      queryClient.invalidateQueries({ queryKey: ['/api/backups'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear el respaldo.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingBackup(false);
      setBackupProgress(0);
    }
  };

  const handleDownloadBackup = (backupId: string, filename: string) => {
    // Simular descarga
    toast({
      title: "Descargando respaldo",
      description: `Iniciando descarga de ${filename}`,
    });
  };

  const handleDeleteBackup = async (backupId: string) => {
    try {
      // Simular eliminación
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: "Respaldo eliminado",
        description: "El respaldo se ha eliminado correctamente.",
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/backups'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el respaldo.",
        variant: "destructive",
      });
    }
  };

  const handleSaveSettings = async () => {
    try {
      // Simular guardado de configuración
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: "Configuración guardada",
        description: "La configuración de respaldos se ha actualizado.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Completado</Badge>;
      case 'in_progress':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">En progreso</Badge>;
      case 'failed':
        return <Badge variant="destructive">Fallido</Badge>;
      default:
        return <Badge variant="secondary">Desconocido</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    return type === 'manual' ? 
      <Badge variant="outline">Manual</Badge> : 
      <Badge variant="secondary">Automático</Badge>;
  };

  return (
    <div className="space-y-6">
      
      {/* Crear nuevo respaldo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Crear Respaldo Manual
          </CardTitle>
          <CardDescription>
            Genera un respaldo completo de la base de datos y archivos del sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isCreatingBackup && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Creando respaldo...</span>
                  <span>{backupProgress}%</span>
                </div>
                <Progress value={backupProgress} className="w-full" />
              </div>
            )}
            
            <div className="flex items-center gap-4">
              <Button 
                onClick={handleCreateBackup}
                disabled={isCreatingBackup}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                {isCreatingBackup ? "Creando..." : "Crear Respaldo"}
              </Button>
              
              <div className="text-sm text-muted-foreground">
                El respaldo incluirá la base de datos, configuraciones y archivos subidos
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuración de respaldos automáticos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Respaldos Automáticos
          </CardTitle>
          <CardDescription>
            Configura la generación automática de respaldos del sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="automaticBackups"
              checked={automaticBackups.enabled}
              onCheckedChange={(checked) => 
                setAutomaticBackups(prev => ({ ...prev, enabled: checked }))
              }
            />
            <Label htmlFor="automaticBackups">Habilitar respaldos automáticos</Label>
          </div>

          {automaticBackups.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="frequency">Frecuencia</Label>
                <Select 
                  value={automaticBackups.frequency}
                  onValueChange={(value) => 
                    setAutomaticBackups(prev => ({ ...prev, frequency: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Diario</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Hora de ejecución</Label>
                <Input
                  id="time"
                  type="time"
                  value={automaticBackups.time}
                  onChange={(e) => 
                    setAutomaticBackups(prev => ({ ...prev, time: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="retention">Retención (días)</Label>
                <Input
                  id="retention"
                  type="number"
                  min="1"
                  max="365"
                  value={automaticBackups.retentionDays}
                  onChange={(e) => 
                    setAutomaticBackups(prev => ({ 
                      ...prev, 
                      retentionDays: parseInt(e.target.value) 
                    }))
                  }
                />
              </div>
            </div>
          )}

          {automaticBackups.enabled && (
            <div className="space-y-3 pt-4">
              <h4 className="font-medium">Contenido del respaldo</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="includeDatabase"
                    checked={automaticBackups.includeDatabase}
                    onCheckedChange={(checked) => 
                      setAutomaticBackups(prev => ({ ...prev, includeDatabase: checked }))
                    }
                  />
                  <Label htmlFor="includeDatabase" className="text-sm">Base de datos</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="includeUploads"
                    checked={automaticBackups.includeUploads}
                    onCheckedChange={(checked) => 
                      setAutomaticBackups(prev => ({ ...prev, includeUploads: checked }))
                    }
                  />
                  <Label htmlFor="includeUploads" className="text-sm">Archivos subidos</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="includeConfigs"
                    checked={automaticBackups.includeConfigs}
                    onCheckedChange={(checked) => 
                      setAutomaticBackups(prev => ({ ...prev, includeConfigs: checked }))
                    }
                  />
                  <Label htmlFor="includeConfigs" className="text-sm">Configuraciones</Label>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Button onClick={handleSaveSettings} className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              Guardar Configuración
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de respaldos existentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="w-5 h-5" />
            Respaldos Existentes
          </CardTitle>
          <CardDescription>
            Administra y descarga los respaldos generados del sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {backups.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <HardDrive className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No hay respaldos disponibles</p>
                <p className="text-sm">Crea tu primer respaldo usando el botón de arriba</p>
              </div>
            ) : (
              <div className="space-y-3">
                {backups.map((backup) => (
                  <div 
                    key={backup.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{backup.filename}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatFileSize(backup.size)} • 
                          {formatDistanceToNow(new Date(backup.createdAt), { 
                            addSuffix: true, 
                            locale: es 
                          })}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {getStatusBadge(backup.status)}
                      {getTypeBadge(backup.type)}
                      
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadBackup(backup.id, backup.filename)}
                          className="h-8 w-8 p-0"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteBackup(backup.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Información del sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Información del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <Database className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <div className="font-medium">Base de Datos</div>
              <div className="text-sm text-muted-foreground">PostgreSQL 14.2</div>
              <div className="text-xs text-green-600 mt-1">Conectada</div>
            </div>
            
            <div className="text-center p-4 bg-muted rounded-lg">
              <HardDrive className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <div className="font-medium">Espacio Disponible</div>
              <div className="text-sm text-muted-foreground">45.2 GB de 100 GB</div>
              <div className="text-xs text-muted-foreground mt-1">54.8% usado</div>
            </div>
            
            <div className="text-center p-4 bg-muted rounded-lg">
              <Clock className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <div className="font-medium">Último Respaldo</div>
              <div className="text-sm text-muted-foreground">Hace 1 día</div>
              <div className="text-xs text-green-600 mt-1">Completado</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BackupSettings;