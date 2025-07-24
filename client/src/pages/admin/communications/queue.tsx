import React from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { ListChecks } from 'lucide-react';
import { QueueSection } from './components';

const CommunicationQueuePage: React.FC = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header con Card pattern */}
        <Card className="bg-gray-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <ListChecks className="w-8 h-8 text-gray-900" />
              <h1 className="text-3xl font-bold text-gray-900">Cola de Emails</h1>
            </div>
          </CardContent>
        </Card>
        
        <QueueSection />
      </div>
    </AdminLayout>
  );
};

export default CommunicationQueuePage;