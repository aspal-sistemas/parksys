import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  Send, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Users, 
  FileText, 
  BarChart3,
  Settings,
  Plus,
  Play,
  Pause,
  Eye
} from 'lucide-react';

export const TemplatesSection: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Plantillas</CardTitle>
          <CardDescription>
            Crea y administra plantillas de email para comunicaciones automatizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Gestión de plantillas en desarrollo</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const QueueSection: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Cola de Emails</CardTitle>
          <CardDescription>
            Monitorea y gestiona emails programados y en proceso
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Cola de emails en desarrollo</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const CampaignsSection: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Campañas</CardTitle>
          <CardDescription>
            Crea y gestiona campañas de email segmentadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Gestión de campañas en desarrollo</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const BulkEmailSection: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Envío Masivo</CardTitle>
          <CardDescription>
            Envía emails a múltiples destinatarios de forma eficiente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <Send className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Envío masivo en desarrollo</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const AnalyticsSection: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Análisis y Reportes</CardTitle>
          <CardDescription>
            Métricas de rendimiento de emails
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <Eye className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Dashboard de análisis en desarrollo</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};