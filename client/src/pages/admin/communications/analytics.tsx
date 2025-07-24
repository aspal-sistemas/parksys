import React from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';
import { AnalyticsSection } from './components';

const CommunicationAnalyticsPage: React.FC = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header con Card pattern */}
        <Card className="bg-gray-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-8 h-8 text-gray-900" />
              <h1 className="text-3xl font-bold text-gray-900">Análisis de Comunicaciones</h1>
            </div>
          </CardContent>
        </Card>
        
        <AnalyticsSection />
      </div>
    </AdminLayout>
  );
};

export default CommunicationAnalyticsPage;