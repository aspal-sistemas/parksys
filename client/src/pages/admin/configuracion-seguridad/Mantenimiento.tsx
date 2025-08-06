import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

export default function Mantenimiento() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("respaldos");
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
    },
    {
      id: '4',
      filename: 'backup-20250108-020000.sql.gz',
      size: 0,
      createdAt: '2025-01-08T02:00:00Z',
      type: 'automatic',
      status: 'failed'
    }
  ];

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const createManualBackup = async () => {
    setIsCreatingBackup(true);
    setBackupProgress(0);

    // Simular progreso del respaldo
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

  const runSystemCleanup = () => {
    toast({
      title: "Limpieza iniciada",
      description: "La limpieza del sistema está en progreso...",
    });
  };

  const optimizeDatabase = () => {
    toast({
      title: "Optimización iniciada",
      description: "La optimización de la base de datos está en progreso...",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header informativo */}
      <Card className="bg-gradient-to-r from-green-50 to-teal-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-900">
            <HardDrive className="h-6 w-6" />
            Sistema de Mantenimiento
          </CardTitle>
          <CardDescription className="text-green-700">
            Gestión de respaldos, optimización del sistema y tareas de mantenimiento automatizado.
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="respaldos" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Respaldos
          </TabsTrigger>
          <TabsTrigger value="optimizacion" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Optimización
          </TabsTrigger>
          <TabsTrigger value="limpieza" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Limpieza
          </TabsTrigger>
          <TabsTrigger value="monitoreo" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Monitoreo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="respaldos" className="space-y-6">
          {/* Configuración de respaldos automáticos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-600" />
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
                        <SelectItem value="daily">Diario</SelectItem>
                        <SelectItem value="weekly">Semanal</SelectItem>
                        <SelectItem value="monthly">Mensual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time">Hora</Label>
                    <Input
                      id="time"
                      type="time"
                      value={automaticBackups.time}
                      onChange={(e) => setAutomaticBackups(prev => ({ ...prev, time: e.target.value }))}
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
                      onChange={(e) => setAutomaticBackups(prev => ({ ...prev, retentionDays: parseInt(e.target.value) }))}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Contenido del respaldo</h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Base de datos</Label>
                      <p className="text-sm text-muted-foreground">Incluir datos de la aplicación</p>
                    </div>
                    <Switch
                      checked={automaticBackups.includeDatabase}
                      onCheckedChange={(checked) => setAutomaticBackups(prev => ({ ...prev, includeDatabase: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Archivos subidos</Label>
                      <p className="text-sm text-muted-foreground">Incluir imágenes y documentos</p>
                    </div>
                    <Switch
                      checked={automaticBackups.includeUploads}
                      onCheckedChange={(checked) => setAutomaticBackups(prev => ({ ...prev, includeUploads: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Configuraciones</Label>
                      <p className="text-sm text-muted-foreground">Incluir configuraciones del sistema</p>
                    </div>
                    <Switch
                      checked={automaticBackups.includeConfigs}
                      onCheckedChange={(checked) => setAutomaticBackups(prev => ({ ...prev, includeConfigs: checked }))}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <Button variant="outline">
                  Restablecer
                </Button>
                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Configuración
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Crear respaldo manual */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Cloud className="h-5 w-5 text-green-600" />
                    Respaldo Manual
                  </CardTitle>
                  <CardDescription>
                    Crear un respaldo inmediato del sistema
                  </CardDescription>
                </div>
                <Button 
                  onClick={createManualBackup} 
                  disabled={isCreatingBackup}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isCreatingBackup ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Crear Respaldo
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            {isCreatingBackup && (
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Progreso del respaldo</span>
                    <span className="text-sm font-medium">{backupProgress}%</span>
                  </div>
                  <Progress value={backupProgress} className="h-2" />
                </div>
              </CardContent>
            )}
          </Card>

          {/* Lista de respaldos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-600" />
                Respaldos Existentes
              </CardTitle>
              <CardDescription>
                Historial de respaldos creados con opciones de descarga y restauración
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {backups.map((backup) => (
                  <div key={backup.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${
                        backup.status === 'completed' ? 'bg-green-100' :
                        backup.status === 'failed' ? 'bg-red-100' : 'bg-yellow-100'
                      }`}>
                        {backup.status === 'completed' ? 
                          <CheckCircle className="h-4 w-4 text-green-600" /> :
                        backup.status === 'failed' ?
                          <AlertCircle className="h-4 w-4 text-red-600" /> :
                          <Clock className="h-4 w-4 text-yellow-600" />
                        }
                      </div>
                      <div>
                        <h3 className="font-medium">{backup.filename}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{formatDistanceToNow(new Date(backup.createdAt), { addSuffix: true, locale: es })}</span>
                          <Badge variant="outline" className="text-xs">
                            {backup.type === 'manual' ? 'Manual' : 'Automático'}
                          </Badge>
                          {backup.size > 0 && (
                            <span>{formatFileSize(backup.size)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {backup.status === 'completed' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadBackup(backup)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Descargar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Restaurar
                          </Button>
                        </>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteBackup(backup)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimizacion" className="space-y-6">
          {/* Optimización de base de datos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-purple-600" />
                Optimización de Base de Datos
              </CardTitle>
              <CardDescription>
                Herramientas para optimizar el rendimiento de la base de datos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Análisis de rendimiento</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded">
                      <span className="text-sm">Fragmentación de tablas</span>
                      <Badge className="bg-yellow-100 text-yellow-800">Media</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <span className="text-sm">Índices sin usar</span>
                      <Badge className="bg-green-100 text-green-800">Bajo</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <span className="text-sm">Consultas lentas</span>
                      <Badge className="bg-red-100 text-red-800">Alto</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <span className="text-sm">Estadísticas desactualizadas</span>
                      <Badge className="bg-yellow-100 text-yellow-800">Media</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Acciones de optimización</h3>
                  <div className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={optimizeDatabase}
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Optimizar tablas
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Actualizar estadísticas
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Database className="h-4 w-4 mr-2" />
                      Reconstruir índices
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Analizar consultas
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configuración de optimización automática */}
          <Card>
            <CardHeader>
              <CardTitle>Optimización Automática</CardTitle>
              <CardDescription>
                Configure las tareas de optimización que se ejecutan automáticamente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Optimización nocturna</Label>
                      <p className="text-sm text-muted-foreground">Ejecutar optimizaciones a las 3:00 AM</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Análisis de consultas</Label>
                      <p className="text-sm text-muted-foreground">Analizar consultas lentas semanalmente</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Limpieza de logs</Label>
                      <p className="text-sm text-muted-foreground">Eliminar logs antiguos mensualmente</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Actualización de estadísticas</Label>
                      <p className="text-sm text-muted-foreground">Actualizar estadísticas diariamente</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="limpieza" className="space-y-6">
          {/* Limpieza del sistema */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-orange-600" />
                Limpieza del Sistema
              </CardTitle>
              <CardDescription>
                Libere espacio eliminando archivos temporales y datos innecesarios
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Archivos temporales</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded">
                      <span className="text-sm">Caché de sesiones</span>
                      <span className="text-sm text-muted-foreground">125 MB</span>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <span className="text-sm">Archivos de log</span>
                      <span className="text-sm text-muted-foreground">89 MB</span>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <span className="text-sm">Imágenes temporales</span>
                      <span className="text-sm text-muted-foreground">234 MB</span>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <span className="text-sm">Respaldos antiguos</span>
                      <span className="text-sm text-muted-foreground">1.2 GB</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Acciones de limpieza</h3>
                  <div className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={runSystemCleanup}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Limpiar archivos temporales
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="h-4 w-4 mr-2" />
                      Rotar logs antiguos
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <HardDrive className="h-4 w-4 mr-2" />
                      Limpiar respaldos expirados
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Optimizar almacenamiento
                    </Button>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Espacio total a liberar: ~1.6 GB</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Se recomienda ejecutar la limpieza para optimizar el rendimiento del sistema.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoreo" className="space-y-6">
          {/* Monitoreo del sistema */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Uso de CPU</CardTitle>
                <Zap className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">23%</div>
                <Progress value={23} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  Promedio últimos 15 minutos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Uso de Memoria</CardTitle>
                <HardDrive className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">67%</div>
                <Progress value={67} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  5.4 GB de 8 GB utilizados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Almacenamiento</CardTitle>
                <Database className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">42%</div>
                <Progress value={42} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  84 GB de 200 GB utilizados
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Estado de servicios */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                Estado de Servicios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span className="font-medium">Servidor Web</span>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Activo
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span className="font-medium">Base de Datos</span>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Activo
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span className="font-medium">Sistema de Archivos</span>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Activo
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span className="font-medium">Servicio de Email</span>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Activo
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span className="font-medium">Respaldos Automáticos</span>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Atención
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span className="font-medium">Monitoreo</span>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Activo
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}