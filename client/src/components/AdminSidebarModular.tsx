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
  ChevronDown,
  ChevronRight,
  Layers,
  ListFilter,
  AlertTriangle,
  Download,
  Upload,
  Image,
  Video,
  Gauge,
  Database,
  Building,
  MapPin,
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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

// Módulo del menú con hijos
interface ModuleNavProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  value: string;
  defaultOpen?: boolean;
}

const ModuleNav: React.FC<ModuleNavProps> = ({ title, icon, children, value, defaultOpen }) => {
  return (
    <AccordionItem value={value} className="border-none">
      <AccordionTrigger className="py-2 hover:bg-gray-100 rounded-md px-3 text-gray-700">
        <div className="flex items-center">
          <span className="mr-3 text-gray-500">{icon}</span>
          <span className="text-sm font-medium">{title}</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pl-10 pt-1 pb-0">
        <div className="space-y-1">
          {children}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

const AdminSidebarModular: React.FC = () => {
  const [location] = useLocation();
  
  // Identificar qué módulos deberían estar abiertos basado en la ruta actual
  const getDefaultAccordionValue = () => {
    if (location.startsWith('/admin/parks') || location.startsWith('/admin/amenities')) 
      return ['spaces'];
    if (location.startsWith('/admin/activities') || location.startsWith('/admin/incidents')) 
      return ['activities'];
    if (location.startsWith('/admin/documents') || location.startsWith('/admin/images') || location.startsWith('/admin/videos')) 
      return ['media'];
    if (location.startsWith('/admin/comments') || location.startsWith('/admin/users')) 
      return ['community'];
    if (location.startsWith('/admin/analytics') || location.startsWith('/admin/reports')) 
      return ['analytics'];
    if (location.startsWith('/admin/settings') || location.startsWith('/admin/municipalities'))
      return ['system'];
    
    return [''];
  };
  
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
          
          <div className="pt-3 pb-1">
            <Accordion type="multiple" defaultValue={getDefaultAccordionValue()} className="space-y-1">
              {/* Módulo de Espacios Verdes */}
              <ModuleNav 
                title="Espacios Verdes" 
                icon={<Layers className="h-5 w-5" />} 
                value="spaces"
              >
                <NavItem 
                  href="/admin/parks" 
                  icon={<Map className="h-4 w-4" />}
                  active={location.startsWith('/admin/parks')}
                >
                  Parques
                </NavItem>
                
                <NavItem 
                  href="/admin/amenities" 
                  icon={<Tag className="h-4 w-4" />}
                  active={location.startsWith('/admin/amenities')}
                >
                  Amenidades
                </NavItem>
                
                <NavItem 
                  href="/admin/municipalities" 
                  icon={<Building className="h-4 w-4" />}
                  active={location.startsWith('/admin/municipalities')}
                >
                  Municipios
                </NavItem>
              </ModuleNav>
              
              {/* Módulo de Actividades y Eventos */}
              <ModuleNav 
                title="Eventos y Reportes" 
                icon={<Calendar className="h-5 w-5" />} 
                value="activities"
              >
                <NavItem 
                  href="/admin/activities" 
                  icon={<Calendar className="h-4 w-4" />}
                  active={location.startsWith('/admin/activities')}
                >
                  Actividades
                </NavItem>
                
                <NavItem 
                  href="/admin/incidents" 
                  icon={<AlertTriangle className="h-4 w-4" />}
                  active={location.startsWith('/admin/incidents')}
                >
                  Incidentes
                </NavItem>
              </ModuleNav>
              
              {/* Módulo de Contenidos Multimedia */}
              <ModuleNav 
                title="Contenido Multimedia" 
                icon={<FileText className="h-5 w-5" />} 
                value="media"
              >
                <NavItem 
                  href="/admin/documents" 
                  icon={<FileText className="h-4 w-4" />}
                  active={location.startsWith('/admin/documents')}
                >
                  Documentos
                </NavItem>
                
                <NavItem 
                  href="/admin/images" 
                  icon={<Image className="h-4 w-4" />}
                  active={location.startsWith('/admin/images')}
                >
                  Imágenes
                </NavItem>
                
                <NavItem 
                  href="/admin/videos" 
                  icon={<Video className="h-4 w-4" />}
                  active={location.startsWith('/admin/videos')}
                >
                  Videos
                </NavItem>
              </ModuleNav>
              
              {/* Módulo de Comunidad */}
              <ModuleNav 
                title="Comunidad" 
                icon={<Users className="h-5 w-5" />} 
                value="community"
              >
                <NavItem 
                  href="/admin/comments" 
                  icon={<MessageSquare className="h-4 w-4" />}
                  active={location.startsWith('/admin/comments')}
                >
                  Comentarios
                </NavItem>
                
                <NavItem 
                  href="/admin/users" 
                  icon={<Users className="h-4 w-4" />}
                  active={location.startsWith('/admin/users')}
                >
                  Usuarios
                </NavItem>
              </ModuleNav>
              
              {/* Módulo de Análisis y Reportes */}
              <ModuleNav 
                title="Análisis y Reportes" 
                icon={<BarChart className="h-5 w-5" />} 
                value="analytics"
              >
                <NavItem 
                  href="/admin/analytics" 
                  icon={<BarChart className="h-4 w-4" />}
                  active={location.startsWith('/admin/analytics')}
                >
                  Dashboard Analítico
                </NavItem>
                
                <NavItem 
                  href="/admin/reports" 
                  icon={<Download className="h-4 w-4" />}
                  active={location.startsWith('/admin/reports')}
                >
                  Exportar Reportes
                </NavItem>
              </ModuleNav>
              
              {/* Módulo de Sistema */}
              <ModuleNav 
                title="Sistema" 
                icon={<Settings className="h-5 w-5" />} 
                value="system"
              >
                <NavItem 
                  href="/admin/settings" 
                  icon={<Settings className="h-4 w-4" />}
                  active={location.startsWith('/admin/settings')}
                >
                  Configuración
                </NavItem>
              </ModuleNav>
            </Accordion>
          </div>
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

export default AdminSidebarModular;