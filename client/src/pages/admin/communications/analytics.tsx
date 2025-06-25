import React from 'react';
import AdminLayout from '@/components/AdminLayout';
import { AnalyticsSection } from './components';

const CommunicationAnalyticsPage: React.FC = () => {
  return (
    <AdminLayout title="Análisis de Comunicaciones">
      <div className="space-y-6">
        <AnalyticsSection />
      </div>
    </AdminLayout>
  );
};

export default CommunicationAnalyticsPage;