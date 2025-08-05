import React from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Megaphone } from 'lucide-react';
import { CampaignsSection } from './components';

const CommunicationCampaignsPage: React.FC = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header con Card pattern */}
        <Card className="bg-gray-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Megaphone className="w-8 h-8 text-gray-900" />
              <h1 className="text-3xl font-bold text-gray-900">Campañas de Email</h1>
            </div>
          </CardContent>
        </Card>
        
        <CampaignsSection />
      </div>
    </AdminLayout>
  );
};

export default CommunicationCampaignsPage;