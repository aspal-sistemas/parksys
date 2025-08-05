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
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
// Importación no necesaria para este componente

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

// Secciones originales
export const OriginalSections = () => {
  return (
    <div className="p-4 border rounded-lg mb-6">
      <h3 className="font-semibold mb-2">Secciones Originales</h3>
      
      <div className="pl-2 space-y-2">
        <div className="py-1">
          <h4 className="font-medium mb-1">Módulo de Espacios Verdes</h4>
          <ul className="text-sm pl-4 space-y-1">
            <li className="flex items-center"><Map className="h-3 w-3 mr-1" /> Parques</li>
            <li className="flex items-center"><Tag className="h-3 w-3 mr-1" /> Amenidades</li>
            <li className="flex items-center"><Building className="h-3 w-3 mr-1" /> Municipios</li>
          </ul>
        </div>
        
        <div className="py-1">
          <h4 className="font-medium mb-1">Módulo de Actividades y Eventos</h4>
          <ul className="text-sm pl-4 space-y-1">
            <li className="flex items-center"><Calendar className="h-3 w-3 mr-1" /> Actividades</li>
            <li className="flex items-center"><AlertTriangle className="h-3 w-3 mr-1" /> Incidentes</li>
          </ul>
        </div>
        
        <div className="py-1">
          <h4 className="font-medium mb-1">Módulo de Contenidos Multimedia</h4>
          <ul className="text-sm pl-4 space-y-1">
            <li className="flex items-center"><FileText className="h-3 w-3 mr-1" /> Documentos</li>
            <li className="flex items-center"><Image className="h-3 w-3 mr-1" /> Imágenes</li>
            <li className="flex items-center"><Video className="h-3 w-3 mr-1" /> Videos</li>
          </ul>
        </div>
        
        <div className="py-1">
          <h4 className="font-medium mb-1">Módulo de Comunidad</h4>
          <ul className="text-sm pl-4 space-y-1">
            <li className="flex items-center"><MessageSquare className="h-3 w-3 mr-1" /> Comentarios</li>
            <li className="flex items-center"><Users className="h-3 w-3 mr-1" /> Usuarios</li>
          </ul>
        </div>
        
        <div className="py-1">
          <h4 className="font-medium mb-1">Módulo de Análisis y Reportes</h4>
          <ul className="text-sm pl-4 space-y-1">
            <li className="flex items-center"><BarChart className="h-3 w-3 mr-1" /> Dashboard Analítico</li>
            <li className="flex items-center"><Download className="h-3 w-3 mr-1" /> Exportar Reportes</li>
          </ul>
        </div>
        
        <div className="py-1">
          <h4 className="font-medium mb-1">Módulo de Sistema</h4>
          <ul className="text-sm pl-4 space-y-1">
            <li className="flex items-center"><Settings className="h-3 w-3 mr-1" /> Configuración</li>
          </ul>
        </div>
      </div>
    </div>
  );
};