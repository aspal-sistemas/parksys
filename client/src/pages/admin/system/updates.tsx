import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import AdminSidebarComplete from "@/components/AdminSidebarComplete";
import Header from "@/components/Header";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { 
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Package,
  Shield,
  Zap,
  Settings,
  Info,
  ExternalLink,
  ArrowUpCircle,
  History,
  AlertCircle
} from "lucide-react";

interface UpdateItem {
  id: string;
  name: string;
  version: string;
  newVersion: string;
  description: string;
  type: 'security' | 'feature' | 'bugfix' | 'maintenance';
  size: string;
  releaseDate: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'available' | 'downloading' | 'installing' | 'completed' | 'failed';
}

interface UpdateHistory {
  id: string;
  name: string;
  version: string;
  installedDate: string;
  type: 'security' | 'feature' | 'bugfix' | 'maintenance';
  status: 'success' | 'failed';
}

export default function SystemUpdates() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("available");
  const [isChecking, setIsChecking] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);

  // Actualizaciones disponibles simuladas
  const availableUpdates: UpdateItem[] = [
    {
      id: '1',
      name: 'ParkSys Core',
      version: '2.1.4',
      newVersion: '2.1.5',
      description: 'Corrección de vulnerabilidades de seguridad y mejoras de rendimiento',
      type: 'security',
      size: '45.2 MB',
      releaseDate: '2025-01-08T10:00:00Z',
      priority: 'critical',
      status: 'available'
    },
    {
      id: '2',
      name: 'UI Components',
      version: '1.8.2',
      newVersion: '1.9.0',
      description: 'Nuevos componentes de interfaz y mejoras de accesibilidad',
      type: 'feature',
      size: '12.8 MB',
      releaseDate: '2025-01-06T14:30:00Z',
      priority: 'medium',
      status: 'available'
    },
    {
      id: '3',
      name: 'Database Engine',
      version: '15.3.0',
      newVersion: '15.3.2',
      description: 'Correcciones de bugs en consultas complejas y optimizaciones',
      type: 'bugfix',
      size: '28.5 MB',
      releaseDate: '2025-01-05T09:15:00Z',
      priority: 'high',
      status: 'available'
    }
  ];

  // Historial de actualizaciones
  const updateHistory: UpdateHistory[] = [
    {
      id: '1',
      name: 'ParkSys Core',
      version: '2.1.4',
      installedDate: '2025-01-05T16:20:00Z',
      type: 'maintenance',
      status: 'success'
    },
    {
      id: '2',
      name: 'Security Patches',
      version: '1.2.1',
      installedDate: '2025-01-03T11:45:00Z',
      type: 'security',
      status: 'success'
    },
    {
      id: '3',
      name: 'UI Components',
      version: '1.8.2',
      installedDate: '2025-01-02T14:10:00Z',
      type: 'feature',
      status: 'success'
    }
  ];

  const getUpdateTypeColor = (type: string) => {
    switch (type) {
      case 'security': return 'bg-red-100 text-red-800';
      case 'feature': return 'bg-blue-100 text-blue-800';
      case 'bugfix': return 'bg-yellow-100 text-yellow-800';
      case 'maintenance': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUpdateTypeIcon = (type: string) => {
    switch (type) {
      case 'security': return <Shield className="h-4 w-4" />;
      case 'feature': return <Zap className="h-4 w-4" />;
      case 'bugfix': return <Settings className="h-4 w-4" />;
      case 'maintenance': return <Package className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const getUpdateTypeName = (type: string) => {
    const names: Record<string, string> = {
      'security': 'Seguridad',
      'feature': 'Funcionalidad',
      'bugfix': 'Corrección',
      'maintenance': 'Mantenimiento'
    };
    return names[type] || type;
  };

  const getPriorityName = (priority: string) => {
    const names: Record<string, string> = {
      'critical': 'Crítica',
      'high': 'Alta',
      'medium': 'Media',
      'low': 'Baja'
    };
    return names[priority] || priority;
  };

  const checkForUpdates = async () => {
    setIsChecking(true);
    
    setTimeout(() => {
      setIsChecking(false);
      toast({
        title: "Búsqueda completada",
        description: "Se encontraron 3 actualizaciones disponibles",
      });
    }, 2000);
  };

  const installUpdate = async (updateId: string) => {
    setUpdateProgress(0);
    
    const interval = setInterval(() => {
      setUpdateProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          toast({
            title: "Actualización completada",
            description: "La actualización se ha instalado correctamente",
          });
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const installAllUpdates = async () => {
    toast({
      title: "Instalando actualizaciones",
      description: "Se están instalando todas las actualizaciones disponibles",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <AdminSidebarComplete />
        <div className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-8">
            <div className="space-y-6">
              {/* Header */}
              <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-900">
                    <ArrowUpCircle className="h-6 w-6" />
                    Centro de Actualizaciones del Sistema
                  </CardTitle>
                  <CardDescription className="text-green-700">
                    Gestión de actualizaciones, parches de seguridad y nuevas funcionalidades.
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Resumen de estado */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Actualizaciones Disponibles</CardTitle>
                    <Package className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">3</div>
                    <p className="text-xs text-muted-foreground">
                      1 crítica, 2 recomendadas
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Versión Actual</CardTitle>
                    <Info className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">2.1.4</div>
                    <p className="text-xs text-muted-foreground">
                      ParkSys Core
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Última Verificación</CardTitle>
                    <Clock className="h-4 w-4 text-orange-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">2h</div>
                    <p className="text-xs text-muted-foreground">
                      hace 2 horas
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Estado del Sistema</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">Estable</div>
                    <p className="text-xs text-muted-foreground">
                      Listo para actualizaciones
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Botones de acción principales */}
              <div className="flex gap-4">
                <Button 
                  onClick={checkForUpdates}
                  disabled={isChecking}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
                  {isChecking ? 'Verificando...' : 'Buscar Actualizaciones'}
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={installAllUpdates}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Instalar Todas
                </Button>
              </div>

              {/* Tabs de contenido */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="available" className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Disponibles ({availableUpdates.length})
                  </TabsTrigger>
                  <TabsTrigger value="history" className="flex items-center gap-2">
                    <History className="h-4 w-4" />
                    Historial
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="available" className="space-y-6">
                  {availableUpdates.map((update) => (
                    <Card key={update.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              {getUpdateTypeIcon(update.type)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold">{update.name}</h3>
                                <Badge className={getUpdateTypeColor(update.type)}>
                                  {getUpdateTypeName(update.type)}
                                </Badge>
                                <Badge className={getPriorityColor(update.priority)}>
                                  {getPriorityName(update.priority)}
                                </Badge>
                              </div>
                              
                              <p className="text-muted-foreground mb-3">
                                {update.description}
                              </p>
                              
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>{update.version} → {update.newVersion}</span>
                                <span>{update.size}</span>
                                <span>
                                  {formatDistanceToNow(new Date(update.releaseDate), { 
                                    locale: es, 
                                    addSuffix: true 
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 ml-4">
                            <Button
                              size="sm"
                              onClick={() => installUpdate(update.id)}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Instalar
                            </Button>
                            <Button variant="ghost" size="sm">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {updateProgress > 0 && updateProgress < 100 && (
                          <div className="mt-4 space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Instalando...</span>
                              <span>{updateProgress}%</span>
                            </div>
                            <Progress value={updateProgress} />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}

                  {availableUpdates.filter(u => u.priority === 'critical').length > 0 && (
                    <Card className="bg-red-50 border-red-200">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                          <div>
                            <h4 className="font-medium text-red-900">Actualizaciones Críticas Disponibles</h4>
                            <p className="text-sm text-red-700 mt-1">
                              Se recomienda instalar las actualizaciones críticas de seguridad lo antes posible.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="history" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <History className="h-5 w-5 text-purple-600" />
                        Historial de Actualizaciones
                      </CardTitle>
                      <CardDescription>
                        Registro de todas las actualizaciones instaladas
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {updateHistory.map((update) => (
                          <div key={update.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-4">
                              <div className="p-2 bg-gray-100 rounded-lg">
                                {getUpdateTypeIcon(update.type)}
                              </div>
                              <div>
                                <h3 className="font-medium">{update.name}</h3>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span>v{update.version}</span>
                                  <span>
                                    {formatDistanceToNow(new Date(update.installedDate), { 
                                      locale: es, 
                                      addSuffix: true 
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Badge className={getUpdateTypeColor(update.type)}>
                                {getUpdateTypeName(update.type)}
                              </Badge>
                              {update.status === 'success' ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-red-600" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}