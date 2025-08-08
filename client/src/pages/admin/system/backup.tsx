import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import AdminSidebarComplete from "@/components/AdminSidebarComplete";
import Header from "@/components/Header";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { 
  HardDrive, 
  Download, 
  Upload,
  Clock,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Settings,
  Save,
  Trash2,
  RefreshCw,
  Calendar,
  Database,
  FileText,
  Cloud,
  Zap,
  BarChart3,
  Shield
} from "lucide-react";

interface BackupItem {
  id: string;
  filename: string;
  size: number;
  createdAt: string;
  type: 'manual' | 'automatic';
  status: 'completed' | 'in_progress' | 'failed';
}

export default function SystemBackup() {
  const { toast } = useToast();
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
      filename: 'backup-20250110-124804.sql.gz',
      size: 45600000, // bytes
      createdAt: '2025-01-10T12:48:04Z',
      type: 'manual',
      status: 'completed'
    },
    {
      id: '2',
      filename: 'backup-20250110-020000.sql.gz',
      size: 43200000,
      createdAt: '2025-01-10T02:00:00Z',
      type: 'automatic',
      status: 'completed'
    },
    {
      id: '3',
      filename: 'backup-20250109-020000.sql.gz',
      size: 42800000,
      createdAt: '2025-01-09T02:00:00Z',
      type: 'automatic',
      status: 'completed'
    }
  ];

  const createManualBackup = async () => {
    setIsCreatingBackup(true);
    setBackupProgress(0);

    // Simular progreso
    const interval = setInterval(() => {
      setBackupProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsCreatingBackup(false);
          toast({
            title: "Respaldo completado",
            description: "El respaldo manual se ha creado exitosamente",
          });
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  const downloadBackup = (backup: BackupItem) => {
    toast({
      title: "Descargando respaldo",
      description: `Iniciando descarga de ${backup.filename}`,
    });
  };

  const deleteBackup = (backup: BackupItem) => {
    toast({
      title: "Respaldo eliminado",
      description: `${backup.filename} ha sido eliminado`,
    });
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusName = (status: string) => {
    const names: Record<string, string> = {
      'completed': 'Completado',
      'in_progress': 'En progreso',
      'failed': 'Falló'
    };
    return names[status] || status;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <AdminSidebarComplete />
        <div className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-8">
            <div className="space-y-6">
              {/* Header informativo */}
              <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-900">
                    <Database className="h-6 w-6" />
                    Sistema de Respaldos
                  </CardTitle>
                  <CardDescription className="text-blue-700">
                    Gestión integral de respaldos de base de datos y archivos del sistema.
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Respaldo manual */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5 text-blue-600" />
                    Crear Respaldo Manual
                  </CardTitle>
                  <CardDescription>
                    Genere un respaldo inmediato de la base de datos y archivos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isCreatingBackup ? (
                    <div className="space-y-4">
                      <div className="text-sm text-muted-foreground">
                        Creando respaldo... {backupProgress}%
                      </div>
                      <Progress value={backupProgress} />
                    </div>
                  ) : (
                    <div className="flex gap-4">
                      <Button onClick={createManualBackup} className="flex items-center gap-2">
                        <Save className="h-4 w-4" />
                        Crear Respaldo Ahora
                      </Button>
                      <Button variant="outline">
                        <Calendar className="h-4 w-4 mr-2" />
                        Programar Respaldo
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Configuración de respaldos automáticos */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-purple-600" />
                    Configuración de Respaldos Automáticos
                  </CardTitle>
                  <CardDescription>
                    Configure la frecuencia y opciones de los respaldos automáticos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Respaldos automáticos</Label>
                          <p className="text-sm text-muted-foreground">Habilitar respaldos programados</p>
                        </div>
                        <Switch
                          checked={automaticBackups.enabled}
                          onCheckedChange={(checked) => setAutomaticBackups(prev => ({ ...prev, enabled: checked }))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="frequency">Frecuencia</Label>
                        <Select 
                          value={automaticBackups.frequency} 
                          onValueChange={(value) => setAutomaticBackups(prev => ({ ...prev, frequency: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hourly">Cada hora</SelectItem>
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
                          onChange={(e) => setAutomaticBackups(prev => ({ ...prev, time: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="retention">Días de retención</Label>
                        <Input
                          id="retention"
                          type="number"
                          min="7"
                          max="365"
                          value={automaticBackups.retentionDays}
                          onChange={(e) => setAutomaticBackups(prev => ({ ...prev, retentionDays: parseInt(e.target.value) }))}
                        />
                      </div>

                      <div className="space-y-3">
                        <Label>Contenido del respaldo</Label>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Base de datos</span>
                          <Switch
                            checked={automaticBackups.includeDatabase}
                            onCheckedChange={(checked) => setAutomaticBackups(prev => ({ ...prev, includeDatabase: checked }))}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm">Archivos subidos</span>
                          <Switch
                            checked={automaticBackups.includeUploads}
                            onCheckedChange={(checked) => setAutomaticBackups(prev => ({ ...prev, includeUploads: checked }))}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm">Configuraciones</span>
                          <Switch
                            checked={automaticBackups.includeConfigs}
                            onCheckedChange={(checked) => setAutomaticBackups(prev => ({ ...prev, includeConfigs: checked }))}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button>
                      <Save className="h-4 w-4 mr-2" />
                      Guardar Configuración
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Lista de respaldos existentes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-green-600" />
                    Respaldos Existentes
                  </CardTitle>
                  <CardDescription>
                    Historial de respaldos disponibles para descarga y restauración
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {backups.map((backup) => (
                      <div key={backup.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Database className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">{backup.filename}</h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>{formatBytes(backup.size)}</span>
                              <span>{formatDistanceToNow(new Date(backup.createdAt), { locale: es, addSuffix: true })}</span>
                              <Badge variant="outline">
                                {backup.type === 'manual' ? 'Manual' : 'Automático'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(backup.status)}>
                            {getStatusName(backup.status)}
                          </Badge>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => downloadBackup(backup)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => deleteBackup(backup)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}