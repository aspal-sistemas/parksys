import React, { useState } from 'react';
import AdminSidebarComplete from './AdminSidebarComplete';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminLayoutProps {
  title?: string | React.ReactNode;
  children: React.ReactNode;
  subtitle?: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ title, subtitle, children }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar fijo global - siempre visible */}
      <AdminSidebarComplete />
      
      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-800/50 z-40 md:hidden" 
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}
      
      {/* Main Content con margen izquierdo para el sidebar */}
      <div className="ml-64 flex flex-col min-h-screen">
        <header className="bg-white shadow-sm z-10">
          <div className="px-6 py-4 flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="mr-4 md:hidden"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </header>
        
        {/* Área gris para títulos */}
        {(title || subtitle) && (
          <div className="bg-gray-100 border-b border-gray-200 px-6 py-4">
            {title && (
              <div className="mb-2">
                {typeof title === 'string' ? (
                  <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
                ) : (
                  title
                )}
              </div>
            )}
            {subtitle && (
              <p className="text-sm text-gray-600">{subtitle}</p>
            )}
          </div>
        )}
        
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export { AdminLayout };
export default AdminLayout;