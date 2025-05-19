import React from 'react';
import { Link, useLocation } from 'wouter';
import { 
  Map, 
  FileText, 
  Calendar, 
  MessageSquare, 
  AlertTriangle, 
  Users, 
  Settings,
  LogOut,
  Menu,
  X,
  Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const [location] = useLocation();
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Check if a link is active
  const isLinkActive = (path: string) => {
    return location === path;
  };

  const handleLogout = () => {
    // Redirect to logout endpoint
    window.location.href = '/api/logout';
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const navItems = [
    { 
      label: 'Dashboard', 
      icon: <Home className="h-5 w-5 mr-3" />, 
      href: '/admin' 
    },
    { 
      label: 'Parques', 
      icon: <Map className="h-5 w-5 mr-3" />, 
      href: '/admin/parks' 
    },
    { 
      label: 'Actividades', 
      icon: <Calendar className="h-5 w-5 mr-3" />, 
      href: '/admin/activities' 
    },
    { 
      label: 'Documentos', 
      icon: <FileText className="h-5 w-5 mr-3" />, 
      href: '/admin/documents' 
    },
    { 
      label: 'Comentarios', 
      icon: <MessageSquare className="h-5 w-5 mr-3" />, 
      href: '/admin/comments' 
    },
    { 
      label: 'Incidencias', 
      icon: <AlertTriangle className="h-5 w-5 mr-3" />, 
      href: '/admin/incidents' 
    },
    { 
      label: 'Usuarios', 
      icon: <Users className="h-5 w-5 mr-3" />, 
      href: '/admin/users' 
    },
    { 
      label: 'Configuración', 
      icon: <Settings className="h-5 w-5 mr-3" />, 
      href: '/admin/settings' 
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Mobile menu toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white shadow-sm py-3 px-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-primary">ParquesMX Admin</h1>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-gray-500"
          onClick={toggleMobileMenu}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </Button>
      </div>

      {/* Sidebar */}
      <div 
        className={`
          fixed lg:relative lg:flex flex-col w-64 bg-white border-r border-gray-200 shadow-sm h-full z-20
          transition-transform duration-300 ease-in-out
          ${mobileMenuOpen ? 'flex transform translate-x-0' : 'hidden lg:flex transform -translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="p-5 border-b">
          <h1 className="text-xl font-semibold text-primary">ParquesMX Admin</h1>
          <p className="text-sm text-gray-500 mt-1">Panel de administración</p>
        </div>

        <ScrollArea className="flex-1">
          <nav className="py-4">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} 
                    className={`
                      flex items-center px-6 py-3 text-sm font-medium rounded-md
                      ${isLinkActive(item.href) 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </ScrollArea>

        <div className="p-4 border-t">
          <Button 
            variant="outline" 
            className="w-full justify-start text-gray-700"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 mr-3" />
            Cerrar sesión
          </Button>
        </div>
      </div>

      {/* Overlay to close menu on mobile */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-10 lg:hidden"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-white shadow-sm border-b px-6 py-4 mt-0 lg:mt-0">
          <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        </header>
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;