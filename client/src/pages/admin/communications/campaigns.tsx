import React from 'react';
import AdminLayout from '@/components/AdminLayout';
import { CampaignsSection } from '../communications/index';

const CommunicationCampaignsPage: React.FC = () => {
  return (
    <AdminLayout title="Campañas de Email">
      <div className="space-y-6">
        <CampaignsSection />
      </div>
    </AdminLayout>
  );
};

export default CommunicationCampaignsPage;