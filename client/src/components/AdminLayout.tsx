import React, { useState } from 'react';
import AdminSidebarPermissions from './AdminSidebarPermissions';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminLayoutProps {
  title?: string;
  children: React.ReactNode;
  subtitle?: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ title, subtitle, children }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar con sistema de permisos integrado */}
      <div className="fixed left-0 top-0 h-full z-50 w-64">
        <AdminSidebarPermissions />
      </div>
      
      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-800/50 z-40 md:hidden" 
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}
      
      {/* Main Content con margen izquierdo para el sidebar */}
      <div className="ml-64 flex flex-col min-h-screen">
        <main className="flex-1 overflow-y-auto p-6 pt-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export { AdminLayout };
export default AdminLayout;