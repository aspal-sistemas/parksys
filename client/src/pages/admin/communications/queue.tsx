import React from 'react';
import AdminLayout from '@/components/AdminLayout';
import { QueueSection } from './components';

const CommunicationQueuePage: React.FC = () => {
  return (
    <AdminLayout title="Cola de Emails">
      <div className="space-y-6">
        <QueueSection />
      </div>
    </AdminLayout>
  );
};

export default CommunicationQueuePage;