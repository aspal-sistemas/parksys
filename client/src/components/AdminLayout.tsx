import React, { useState } from 'react';
import AdminSidebarComplete from './AdminSidebarComplete';
import { HelpCenter } from './HelpCenter';
import { Menu, HelpCircle, Home, Shield, Users, Building, TrendingUp, MessageSquare, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Link } from 'wouter';

interface AdminLayoutProps {
  title?: string;
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
        {/* Admin Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left side - Navigation */}
            <div className="flex items-center space-x-6">
              <Link href="/admin">
                <Button variant="ghost" className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                  <Home className="h-4 w-4" />
                  Páneles de Control
                </Button>
              </Link>
              
              {/* Gestión Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                    <Building className="h-4 w-4" />
                    Gestión
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/admin/visitors/dashboard">Visitantes</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/parks">Parques</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/trees/dashboard">Arbolado</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/activities">Actividades</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* O & M Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                    <TrendingUp className="h-4 w-4" />
                    O & M
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/admin/assets/dashboard">Activos</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/incidents">Incidencias</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/volunteers">Voluntarios</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Admin & Finanzas Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                    <TrendingUp className="h-4 w-4" />
                    Admin & Finanzas
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/admin/finance">Finanzas</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/concessions">Concesiones</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mkt & Comm Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                    <MessageSquare className="h-4 w-4" />
                    Mkt & Comm
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/admin/marketing">Marketing</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/advertising">Publicidad</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/communications">Comunicaciones</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* RH Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                    <Users className="h-4 w-4" />
                    RH
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/admin/hr">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/hr/employees">Empleados</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Seguridad Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                    <Shield className="h-4 w-4" />
                    Seguridad
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/admin/security">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/security/users">Usuarios</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Right side - Help and View Site */}
            <div className="flex items-center space-x-4">
              {/* Help Center Button */}
              <HelpCenter>
                <Button variant="ghost" size="sm" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                  <HelpCircle className="h-4 w-4" />
                  Ayuda
                </Button>
              </HelpCenter>
              
              {/* View Public Site */}
              <Link href="/">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Ver Sitio Público
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export { AdminLayout };
export default AdminLayout;