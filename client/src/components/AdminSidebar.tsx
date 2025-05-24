import React, { useState } from 'react';
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
  LogOut,
  Tag,
  BarChart,
  Package,
  Shield,
  User,
  ListFilter,
  Workflow,
  Building,
  Upload,
  Archive,
  Boxes,
  Box,
  Wrench,
  CalendarDays,
  CircleDollarSign,
  MapPin,
  GraduationCap,
  Award,
  Clipboard,
  BadgeCheck,
  LayoutGrid
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  active?: boolean;
}

interface ModuleNavProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  value: string;
  defaultOpen?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ 
  href, 
  icon, 
  children,
  active
}) => {
  return (
    <Link href={href}>
      <Button 
        variant={active ? "secondary" : "ghost"} 
        className={cn(
          "w-full justify-start",
          active && "bg-secondary" 
        )}
      >
        {icon}
        <span className="ml-2">{children}</span>
      </Button>
    </Link>
  );
};

const ModuleNav: React.FC<ModuleNavProps> = ({ 
  title,
  icon,
  children,
  value,
  defaultOpen
}) => {
  return (
    <AccordionItem value={value} className="border-0">
      <AccordionTrigger className="py-2 hover:no-underline">
        <div className="flex items-center text-sm font-medium">
          <div className="mr-2">{icon}</div>
          {title}
        </div>
      </AccordionTrigger>
      <AccordionContent className="pl-2 pb-0">
        <div className="flex flex-col gap-1 pt-1">
          {children}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

const AdminSidebar: React.FC = () => {
  const [location] = useLocation();
  const [defaultAccordion, setDefaultAccordion] = useState<string[]>(['users']);
  
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
        <Accordion
          type="multiple"
          defaultValue={defaultAccordion}
          className="px-3 space-y-1"
        >
          <NavItem 
            href="/admin" 
            icon={<Home className="h-5 w-5" />}
            active={location === '/admin'}
          >
            Dashboard
          </NavItem>

          <ModuleNav 
            title="Usuarios" 
            icon={<Users className="h-5 w-5" />}
            value="users"
          >
            <NavItem 
              href="/admin/users" 
              icon={<User className="h-5 w-5" />}
              active={location === '/admin/users'}
            >
              Lista de Usuarios
            </NavItem>
            <NavItem 
              href="/admin/permissions" 
              icon={<Shield className="h-5 w-5" />}
              active={location === '/admin/permissions'}
            >
              Permisos de Roles
            </NavItem>
          </ModuleNav>
          
          <ModuleNav 
            title="Actividades" 
            icon={<Calendar className="h-5 w-5" />}
            value="activities"
          >
            <NavItem 
              href="/admin/activities" 
              icon={<Calendar className="h-5 w-5" />}
              active={location.startsWith('/admin/activities') && !location.startsWith('/admin/activities/calendar')}
            >
              Gestión de Actividades
            </NavItem>
            <NavItem 
              href="/admin/activities/calendar" 
              icon={<Calendar className="h-5 w-5" />}
              active={location.startsWith('/admin/activities/calendar')}
            >
              Calendario
            </NavItem>
            <NavItem 
              href="/admin/organizador" 
              icon={<ListFilter className="h-5 w-5" />}
              active={location.startsWith('/admin/organizador') && 
                      !location.startsWith('/admin/organizador/nueva-actividad') && 
                      !location.startsWith('/admin/organizador/catalogo')}
            >
              Organizador
            </NavItem>
            <NavItem 
              href="/admin/organizador/nueva-actividad" 
              icon={<Calendar className="h-5 w-5" />}
              active={location.startsWith('/admin/organizador/nueva-actividad')}
            >
              Nueva Actividad
            </NavItem>
            <NavItem 
              href="/admin/organizador/catalogo/ver" 
              icon={<FileText className="h-5 w-5" />}
              active={location.startsWith('/admin/organizador/catalogo/ver')}
            >
              Catálogo de Actividades
            </NavItem>
            <NavItem 
              href="/admin/organizador/catalogo/crear" 
              icon={<FileText className="h-5 w-5" />}
              active={location.startsWith('/admin/organizador/catalogo/crear')}
            >
              Crear Actividad en Catálogo
            </NavItem>
            <NavItem 
              href="/admin/instructors" 
              icon={<GraduationCap className="h-5 w-5" />}
              active={location === '/admin/instructors'}
            >
              Gestión de Instructores
            </NavItem>
            <NavItem 
              href="/admin/instructors/detail" 
              icon={<User className="h-5 w-5" />}
              active={location.startsWith('/admin/instructors/detail')}
            >
              Detalle de Instructor
            </NavItem>
            <NavItem 
              href="/admin/instructors/cards" 
              icon={<LayoutGrid className="h-5 w-5" />}
              active={location.startsWith('/admin/instructors/cards')}
            >
              Tarjetas de Instructores
            </NavItem>
            <NavItem 
              href="/admin/instructors/evaluations" 
              icon={<Clipboard className="h-5 w-5" />}
              active={location.startsWith('/admin/instructors/evaluations')}
            >
              Evaluaciones de Instructores
            </NavItem>
            <NavItem 
              href="/admin/evaluaciones" 
              icon={<BadgeCheck className="h-5 w-5" />}
              active={location.startsWith('/admin/evaluaciones')}
            >
              Evaluaciones Generales
            </NavItem>
          </ModuleNav>
          
          <ModuleNav 
            title="Operaciones" 
            icon={<Workflow className="h-5 w-5" />}
            value="operations"
          >
            <NavItem 
              href="/admin/parks" 
              icon={<Map className="h-5 w-5" />}
              active={location.startsWith('/admin/parks') && !location.startsWith('/admin/parks-import')}
            >
              Parques
            </NavItem>
            <NavItem 
              href="/admin/parks-import" 
              icon={<Upload className="h-5 w-5" />}
              active={location.startsWith('/admin/parks-import')}
            >
              Importar Parques
            </NavItem>
            <NavItem 
              href="/admin/amenities" 
              icon={<Tag className="h-5 w-5" />}
              active={location.startsWith('/admin/amenities')}
            >
              Amenidades
            </NavItem>
            <NavItem 
              href="/admin/incidents" 
              icon={<Bell className="h-5 w-5" />}
              active={location === '/admin/incidents' || (location.startsWith('/admin/incidents/') && location.includes('/admin/incidents/[id]'))}
            >
              Gestión de Incidencias
            </NavItem>
            <NavItem 
              href="/admin/incidents/categories" 
              icon={<Tag className="h-5 w-5" />}
              active={location.startsWith('/admin/incidents/categories')}
            >
              Categorías de Incidencias
            </NavItem>
            <NavItem 
              href="/admin/incidents/dashboard" 
              icon={<BarChart className="h-5 w-5" />}
              active={location.startsWith('/admin/incidents/dashboard') || 
                     location.startsWith('/admin/dashboard-incidencias') || 
                     location.startsWith('/admin/incidentes-dashboard')}
            >
              Dashboard de Incidencias
            </NavItem>
          </ModuleNav>
          
          <ModuleNav 
            title="Activos" 
            icon={<Archive className="h-5 w-5" />}
            value="assets"
            defaultOpen={true}
          >
            <NavItem 
              href="/admin/assets" 
              icon={<Boxes className="h-5 w-5" />}
              active={location === '/admin/assets' || 
                     (location.startsWith('/admin/assets/') && location.includes('/admin/assets/[id]'))}
            >
              Gestión de Activos
            </NavItem>
            <NavItem 
              href="/admin/assets/new" 
              icon={<FileText className="h-5 w-5" />}
              active={location.startsWith('/admin/assets/new')}
            >
              Nuevo Activo
            </NavItem>
            <NavItem 
              href="/admin/assets/categories" 
              icon={<Tag className="h-5 w-5" />}
              active={location.startsWith('/admin/assets/categories')}
            >
              Categorías
            </NavItem>
            <NavItem 
              href="/admin/assets/inventory" 
              icon={<Package className="h-5 w-5" />}
              active={location.startsWith('/admin/assets/inventory')}
            >
              Inventario
            </NavItem>
            <NavItem 
              href="/admin/assets/map" 
              icon={<Map className="h-5 w-5" />}
              active={location === '/admin/assets/map'}
            >
              Mapa de Activos
            </NavItem>
            <NavItem 
              href="/admin/assets/map-simple" 
              icon={<MapPin className="h-5 w-5" />}
              active={location.startsWith('/admin/assets/map-simple')}
            >
              Mapa Simplificado
            </NavItem>
            <NavItem 
              href="/admin/assets/maintenance-calendar" 
              icon={<CalendarDays className="h-5 w-5" />}
              active={location.startsWith('/admin/assets/maintenance-calendar')}
            >
              Calendario de Mantenimiento
            </NavItem>
            <NavItem 
              href="/admin/assets/schedule-maintenance" 
              icon={<Calendar className="h-5 w-5" />}
              active={location.startsWith('/admin/assets/schedule-maintenance')}
            >
              Programar Mantenimiento
            </NavItem>
            <NavItem 
              href="/admin/assets/assign-manager" 
              icon={<User className="h-5 w-5" />}
              active={location.startsWith('/admin/assets/assign-manager')}
            >
              Asignar Responsable
            </NavItem>
            <NavItem 
              href="/admin/assets/assign-equipment" 
              icon={<Box className="h-5 w-5" />}
              active={location.startsWith('/admin/assets/assign-equipment')}
            >
              Asignar Equipamiento
            </NavItem>
            <NavItem 
              href="/admin/assets/report-issue" 
              icon={<Bell className="h-5 w-5" />}
              active={location.startsWith('/admin/assets/report-issue')}
            >
              Reportar Incidencia
            </NavItem>
            <NavItem 
              href="/admin/assets/dashboard" 
              icon={<BarChart className="h-5 w-5" />}
              active={location.startsWith('/admin/assets/dashboard')}
            >
              Dashboard de Activos
            </NavItem>
          </ModuleNav>
        </Accordion>
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