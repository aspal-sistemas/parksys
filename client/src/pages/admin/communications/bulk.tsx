import React from 'react';
import AdminLayout from '@/components/AdminLayout';
import { BulkEmailSection } from './components';

const CommunicationBulkPage: React.FC = () => {
  return (
    <AdminLayout title="Envío Masivo">
      <div className="space-y-6">
        <BulkEmailSection />
      </div>
    </AdminLayout>
  );
};

export default CommunicationBulkPage;