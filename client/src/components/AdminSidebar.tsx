import React from 'react';
import { Link, useLocation } from 'wouter';
import { 
  Home, 
  Map, 
  Calendar, 
  FileText, 
  MessageSquare, 
  Bell, 
  Users, 
  Settings, 
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  active?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ href, icon, children, active }) => {
  return (
    <Link href={href}>
      <div className={`flex items-center pl-3 pr-4 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
        active 
          ? 'bg-primary text-primary-foreground' 
          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
      }`}>
        <span className={`mr-3 ${active ? 'text-primary-foreground' : 'text-gray-500'}`}>
          {icon}
        </span>
        {children}
      </div>
    </Link>
  );
};

const AdminSidebar: React.FC = () => {
  const [location] = useLocation();
  
  return (
    <div className="h-screen border-r bg-white flex flex-col">
      <div className="p-4 flex items-center">
        <svg className="h-8 w-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
          <path d="M5 16c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm0-8c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm4 8c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm0-8c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm7.5-4c.28 0 .5.22.5.5s-.22.5-.5.5-.5-.22-.5-.5.22-.5.5-.5zM5 12c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm7 0c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm1-8.5c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5zM17 12c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm2-5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm0 8c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm-7-10c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm0 8c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm-4-8c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"></path>
        </svg>
        <h1 className="ml-2 text-xl font-heading font-semibold text-gray-900">
          Admin Panel
        </h1>
      </div>
      
      <Separator />
      
      <ScrollArea className="flex-1 py-2">
        <nav className="px-2 space-y-1">
          <NavItem 
            href="/admin" 
            icon={<Home className="h-5 w-5" />}
            active={location === '/admin'}
          >
            Dashboard
          </NavItem>
          
          <NavItem 
            href="/admin/users" 
            icon={<Users className="h-5 w-5" />}
            active={location.startsWith('/admin/users')}
          >
            Usuarios
          </NavItem>
          
          <NavItem 
            href="/admin/activities" 
            icon={<Calendar className="h-5 w-5" />}
            active={location.startsWith('/admin/activities')}
          >
            Actividades
          </NavItem>
          
          <NavItem 
            href="/admin/assets" 
            icon={<FileText className="h-5 w-5" />}
            active={location.startsWith('/admin/assets')}
          >
            Activos
          </NavItem>
          
          <NavItem 
            href="/admin/incidents" 
            icon={<Bell className="h-5 w-5" />}
            active={location.startsWith('/admin/incidents')}
          >
            Incidentes
          </NavItem>
          
          <NavItem 
            href="/admin/incidents/dashboard" 
            icon={<Bell className="h-5 w-5" />}
            active={location.startsWith('/admin/incidents/dashboard')}
          >
            Dashboard Incidencias
          </NavItem>
          
          <NavItem 
            href="/admin/parks" 
            icon={<Map className="h-5 w-5" />}
            active={location.startsWith('/admin/parks')}
          >
            Parques
          </NavItem>
          
          <NavItem 
            href="/admin/comments" 
            icon={<MessageSquare className="h-5 w-5" />}
            active={location.startsWith('/admin/comments')}
          >
            Comentarios
          </NavItem>
        </nav>
      </ScrollArea>
      
      <div className="p-4 border-t">
        <div className="flex items-center mb-4">
          <div className="bg-gray-200 rounded-full h-10 w-10 flex items-center justify-center text-gray-600">
            <span className="font-medium">AD</span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">Admin</p>
            <p className="text-xs text-gray-500">admin@parquesmx.com</p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Settings className="h-4 w-4 mr-1" />
            Cuenta
          </Button>
          
          <Link href="/admin/login">
            <Button variant="ghost" size="sm" className="flex-1 text-red-500 hover:bg-red-50 hover:text-red-600">
              <LogOut className="h-4 w-4 mr-1" />
              Salir
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;