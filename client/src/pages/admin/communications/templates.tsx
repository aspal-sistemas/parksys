import React from 'react';
import AdminLayout from '@/components/AdminLayout';
import { TemplatesSection } from '../communications/index';

const CommunicationTemplatesPage: React.FC = () => {
  return (
    <AdminLayout title="Plantillas de Email">
      <div className="space-y-6">
        <TemplatesSection />
      </div>
    </AdminLayout>
  );
};

export default CommunicationTemplatesPage;