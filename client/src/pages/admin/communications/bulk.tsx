import React from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Send } from 'lucide-react';
import { BulkEmailSection } from './components';

const CommunicationBulkPage: React.FC = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header con Card pattern */}
        <Card className="bg-gray-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Send className="w-8 h-8 text-gray-900" />
              <h1 className="text-3xl font-bold text-gray-900">Envío Masivo</h1>
            </div>
          </CardContent>
        </Card>
        
        <BulkEmailSection />
      </div>
    </AdminLayout>
  );
};

export default CommunicationBulkPage;