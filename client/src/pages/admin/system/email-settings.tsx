import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Mail, Send, CheckCircle, XCircle, Settings, TestTube } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";

export default function EmailSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [testEmail, setTestEmail] = useState({
    to: "",
    subject: "Email de Prueba - ParkSys",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #00a587;">Email de Prueba</h2>
        <p>Este es un email de prueba enviado desde el sistema ParkSys.</p>
        <p>Si recibes este mensaje, la configuración de email está funcionando correctamente.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #6c757d; font-size: 12px;">
          Sistema ParkSys - Configuración de Email
        </p>
      </div>
    `
  });

  // Query para probar la conexión
  const { data: connectionStatus, isLoading: testingConnection, refetch: testConnection } = useQuery({
    queryKey: ["/api/email/test-connection"],
    enabled: false
  });

  // Mutación para enviar email de prueba
  const sendTestEmailMutation = useMutation({
    mutationFn: async (emailData: typeof testEmail) => {
      const response = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error enviando email");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Email enviado",
        description: "El email de prueba se envió correctamente",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleTestConnection = async () => {
    const result = await testConnection();
    if (result.data?.success) {
      toast({
        title: "Conexión exitosa",
        description: `Conectado usando ${result.data.method}`,
      });
    } else {
      toast({
        title: "Error de conexión",
        description: result.data?.error || "No se pudo conectar",
        variant: "destructive",
      });
    }
  };

  const handleSendTestEmail = () => {
    if (!testEmail.to) {
      toast({
        title: "Error",
        description: "Ingresa un email de destino",
        variant: "destructive",
      });
      return;
    }
    sendTestEmailMutation.mutate(testEmail);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Configuración de Email
          </h1>
          <p className="text-gray-600 mt-2">
            Gestiona la configuración del sistema de correo electrónico
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Estado de Conexión */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Estado del Sistema
              </CardTitle>
              <CardDescription>
                Verifica la configuración y conexión del servicio de email
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleTestConnection}
                disabled={testingConnection}
                className="w-full"
              >
                <TestTube className="h-4 w-4 mr-2" />
                {testingConnection ? "Probando..." : "Probar Conexión"}
              </Button>

              {connectionStatus && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {connectionStatus.success ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span className="font-medium">
                      {connectionStatus.success ? "Conectado" : "Desconectado"}
                    </span>
                  </div>
                  
                  {connectionStatus.success && (
                    <Badge variant="secondary">
                      Método: {connectionStatus.method}
                    </Badge>
                  )}
                  
                  {connectionStatus.error && (
                    <p className="text-sm text-red-600">
                      {connectionStatus.error}
                    </p>
                  )}
                </div>
              )}

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium">Configuración de Email:</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Puedes usar SendGrid (profesional) o Gmail (alternativo)
                </p>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>SENDGRID_API_KEY:</span>
                    <Badge variant={process.env.SENDGRID_API_KEY ? "default" : "destructive"}>
                      {process.env.SENDGRID_API_KEY ? "Configurado" : "Faltante"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>GMAIL_USER:</span>
                    <Badge variant={process.env.GMAIL_USER ? "default" : "secondary"}>
                      {process.env.GMAIL_USER ? "Configurado" : "Opcional"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>GMAIL_APP_PASSWORD:</span>
                    <Badge variant={process.env.GMAIL_APP_PASSWORD ? "default" : "secondary"}>
                      {process.env.GMAIL_APP_PASSWORD ? "Configurado" : "Opcional"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email de Prueba */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email de Prueba
              </CardTitle>
              <CardDescription>
                Envía un email de prueba para verificar el funcionamiento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="test-email-to">Destinatario</Label>
                <Input
                  id="test-email-to"
                  type="email"
                  placeholder="ejemplo@correo.com"
                  value={testEmail.to}
                  onChange={(e) => setTestEmail({ ...testEmail, to: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="test-email-subject">Asunto</Label>
                <Input
                  id="test-email-subject"
                  value={testEmail.subject}
                  onChange={(e) => setTestEmail({ ...testEmail, subject: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="test-email-content">Contenido HTML</Label>
                <Textarea
                  id="test-email-content"
                  rows={8}
                  value={testEmail.html}
                  onChange={(e) => setTestEmail({ ...testEmail, html: e.target.value })}
                />
              </div>

              <Button 
                onClick={handleSendTestEmail}
                disabled={sendTestEmailMutation.isPending}
                className="w-full"
              >
                <Send className="h-4 w-4 mr-2" />
                {sendTestEmailMutation.isPending ? "Enviando..." : "Enviar Email de Prueba"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Instrucciones de Configuración */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-600">Opción 1: SendGrid (Recomendado)</CardTitle>
              <CardDescription>
                Servicio profesional con alta entregabilidad
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900">Pasos para configurar:</h4>
                <ol className="list-decimal list-inside text-sm text-blue-800 mt-2 space-y-1">
                  <li>Crea cuenta en <a href="https://sendgrid.com" target="_blank" className="underline">sendgrid.com</a></li>
                  <li>Ve a Settings → API Keys</li>
                  <li>Crea nueva API Key con permisos de envío</li>
                  <li>Copia la clave y agrégala como SENDGRID_API_KEY</li>
                </ol>
              </div>
              <div className="text-sm">
                <strong>Ventajas:</strong> Alta entregabilidad, análiticas, plantillas dinámicas
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">Opción 2: Gmail/Google Workspace</CardTitle>
              <CardDescription>
                Alternativa usando tu cuenta de Gmail
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900">Pasos para configurar:</h4>
                <ol className="list-decimal list-inside text-sm text-green-800 mt-2 space-y-1">
                  <li>Ve a tu <a href="https://myaccount.google.com" target="_blank" className="underline">Cuenta de Google</a></li>
                  <li>Seguridad → Verificación en 2 pasos (activar)</li>
                  <li>Generar "Contraseña de aplicación"</li>
                  <li>Configura GMAIL_USER (tu email) y GMAIL_APP_PASSWORD</li>
                </ol>
              </div>
              <div className="text-sm">
                <strong>Ventajas:</strong> Fácil configuración, sin costo adicional, familiar
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Plantillas de Email Disponibles */}
        <Card>
          <CardHeader>
            <CardTitle>Plantillas de Email Disponibles</CardTitle>
            <CardDescription>
              El sistema incluye plantillas predefinidas para diferentes procesos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Email de Bienvenida</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Se envía automáticamente cuando se crea un nuevo usuario o empleado
                </p>
                <Badge variant="secondary">Automático</Badge>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Evento Aprobado</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Notifica cuando una solicitud de evento es aprobada
                </p>
                <Badge variant="secondary">Automático</Badge>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Nómina Procesada</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Informa a empleados cuando su nómina ha sido procesada
                </p>
                <Badge variant="secondary">Automático</Badge>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Recordatorio de Mantenimiento</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Alerta sobre fechas de mantenimiento programado
                </p>
                <Badge variant="secondary">Automático</Badge>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Registro de Voluntario</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Confirma el registro exitoso de nuevos voluntarios
                </p>
                <Badge variant="secondary">Automático</Badge>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Email Personalizado</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Permite enviar emails personalizados usando la API
                </p>
                <Badge variant="outline">API</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}