import { Shield } from 'lucide-react';
import { Card } from '@/components/ui/card';
import SecurityDashboard from './SecurityDashboard';
import AdminLayout from '@/components/AdminLayout';

export default function SecurityModule() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header con título */}
        <Card className="p-4 bg-gray-50">
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-gray-900" />
            <h1 className="text-3xl font-bold text-gray-900">Seguridad</h1>
          </div>
          <p className="text-gray-600 mt-2">Centro de control de seguridad y monitoreo del sistema</p>
        </Card>
        
        {/* Dashboard directo sin pestañas */}
        <SecurityDashboard />
      </div>
    </AdminLayout>
  );
}