import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import UserProfileImage from '@/components/UserProfileImage';
import { 
  Home, 
  Map, 
  Calendar, 
  FileText, 
  Users, 
  Settings, 
  LogOut,
  Tag,
  BarChart,
  Package,
  Shield,
  User,
  ListFilter,
  CalendarDays,
  GraduationCap,
  Workflow,
  Archive,
  Boxes,
  Wrench,
  Bell
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  active?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ href, icon, children, active }) => {
  return (
    <Link href={href}>
      <div className={`
        flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors
        ${active 
          ? 'bg-primary text-white' 
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        }
      `}>
        {icon}
        <span className="ml-3">{children}</span>
      </div>
    </Link>
  );
};

const AdminSidebarFixed: React.FC = () => {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className="h-screen border-r bg-white flex flex-col">
      <div className="p-4 flex items-center">
        <svg className="h-8 w-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
          <path d="M5 16c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm0-8c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm4 8c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm0-8c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm7.5-4c.28 0 .5.22.5.5s-.22.5-.5.5-.5-.22-.5-.5.22-.5.5-.5zM5 12c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm7 0c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm1-8.5c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5zM17 12c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm2-5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm0 8c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm-7-10c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm0 8c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm-4-8c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"></path>
        </svg>
        <h1 className="ml-2 text-xl font-heading font-semibold text-gray-900">
          ParquesMX
        </h1>
      </div>
      
      <Separator />
      
      <ScrollArea className="flex-1 py-2">
        <div className="px-3 space-y-1">
          <NavItem 
            href="/admin" 
            icon={<Home className="h-5 w-5" />}
            active={location === '/admin'}
          >
            Dashboard
          </NavItem>

          <NavItem 
            href="/admin/settings" 
            icon={<Settings className="h-5 w-5" />}
            active={location === '/admin/settings'}
          >
            Configuración
          </NavItem>

          <NavItem 
            href="/admin/permissions" 
            icon={<Shield className="h-5 w-5" />}
            active={location === '/admin/permissions'}
          >
            Permisos
          </NavItem>

          <NavItem 
            href="/admin/users" 
            icon={<Users className="h-5 w-5" />}
            active={location === '/admin/users'}
          >
            Usuarios
          </NavItem>

          {/* SECCIÓN ACTIVIDADES */}
          <Accordion type="multiple" defaultValue={['activities']} className="w-full">
            <AccordionItem value="activities" className="border-none">
              <AccordionTrigger className="flex items-center px-4 py-2.5 text-sm font-medium rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 no-underline">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5" />
                  <span className="ml-3">Actividades</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-0">
                <div className="flex flex-col gap-1 pt-1 pl-4">
                  <NavItem 
                    href="/admin/organizador" 
                    icon={<FileText className="h-5 w-5" />}
                    active={location.startsWith('/admin/organizador') && 
                            !location.startsWith('/admin/organizador/nueva-actividad') && 
                            !location.startsWith('/admin/organizador/catalogo')}
                  >
                    Organizador
                  </NavItem>
                  
                  <NavItem 
                    href="/admin/activities" 
                    icon={<ListFilter className="h-5 w-5" />}
                    active={location.startsWith('/admin/activities')}
                  >
                    Listado
                  </NavItem>
                  
                  <NavItem 
                    href="/admin/organizador/nueva-actividad" 
                    icon={<Calendar className="h-5 w-5" />}
                    active={location.startsWith('/admin/organizador/nueva-actividad')}
                  >
                    Nueva Actividad
                  </NavItem>
                  
                  <NavItem 
                    href="/admin/activities/calendar" 
                    icon={<CalendarDays className="h-5 w-5" />}
                    active={location.startsWith('/admin/activities/calendar')}
                  >
                    Calendario
                  </NavItem>
                  
                  <NavItem 
                    href="/admin/instructors" 
                    icon={<GraduationCap className="h-5 w-5" />}
                    active={location === '/admin/instructors'}
                  >
                    Instructores
                  </NavItem>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Resto de secciones */}
          <NavItem 
            href="/admin/parks" 
            icon={<Map className="h-5 w-5" />}
            active={location.startsWith('/admin/parks')}
          >
            Parques
          </NavItem>
        </div>
      </ScrollArea>
      
      <Separator />
      
      <div className="p-4">
        <div className="flex items-center space-x-3 mb-3">
          <UserProfileImage user={user} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.firstName && user?.lastName 
                ? `${user.firstName} ${user.lastName}` 
                : user?.fullName || user?.username || 'Usuario'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.role}
            </p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={logout}
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4 mr-1" />
          Salir
        </Button>
      </div>
    </div>
  );
};

export default AdminSidebarFixed;