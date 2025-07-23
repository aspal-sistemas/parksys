import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, FileText, AlertTriangle } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import SolicitudBajoImpacto from "./solicitud-bajo-impacto";
import SolicitudAltoImpacto from "./solicitud-alto-impacto";

export default function EventosAmbuIndex() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header con patrón Card estandarizado */}
        <Card className="p-4 bg-gray-50">
          <div className="flex items-center gap-2">
            <Calendar className="w-8 h-8 text-gray-900" />
            <h1 className="text-3xl font-bold text-gray-900">Eventos</h1>
          </div>
          <p className="text-gray-600 mt-2">
            Sistema de solicitudes para eventos en espacios públicos según formularios oficiales
          </p>
        </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Solicitudes de Eventos
          </CardTitle>
          <CardDescription>
            Gestiona las solicitudes de eventos de bajo y alto impacto según los formularios oficiales F-DIC-22 y F-DIC-23
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="bajo-impacto" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="bajo-impacto" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Evento Bajo Impacto
              </TabsTrigger>
              <TabsTrigger value="alto-impacto" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Evento Alto Impacto
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="bajo-impacto" className="mt-6">
              <div className="border rounded-lg p-1">
                <SolicitudBajoImpacto />
              </div>
            </TabsContent>
            
            <TabsContent value="alto-impacto" className="mt-6">
              <div className="border rounded-lg p-1">
                <SolicitudAltoImpacto />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      </div>
    </AdminLayout>
  );
}