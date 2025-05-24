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
  CreditCard,
  ClipboardCheck,
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
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  Calculator,
  Megaphone,
  Handshake,
  Store,
  ListChecks,
  Clipboard,
  BadgeCheck,
  LayoutGrid,
  Flower2,
  FileEdit,
  Scissors,
  AlertTriangle,
  Leaf
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
  // Clonamos el icono para aplicarle la clase de menú-ícono verde
  const iconWithClass = React.cloneElement(icon as React.ReactElement, {
    className: cn((icon as React.ReactElement).props.className, 'menu-icon')
  });

  return (
    <Link href={href}>
      <Button 
        variant={active ? "secondary" : "ghost"} 
        className={cn(
          "w-full justify-start",
          active && "bg-secondary" 
        )}
      >
        {iconWithClass}
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
  // Clonamos el icono para aplicarle la clase de menú-ícono verde
  const iconWithClass = React.cloneElement(icon as React.ReactElement, {
    className: cn((icon as React.ReactElement).props.className, 'menu-icon')
  });

  return (
    <AccordionItem value={value} className="border-0">
      <AccordionTrigger className="py-2 hover:no-underline">
        <div className="flex items-center text-sm font-medium">
          <div className="mr-2">{iconWithClass}</div>
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
  
  // Determinar qué sección debe estar abierta basado en la URL actual
  const getInitialOpenSections = () => {
    if (location.startsWith('/admin/assets')) return ['assets'];
    if (location.startsWith('/admin/activities')) return ['activities'];
    if (location.startsWith('/admin/instructors')) return ['activities']; // Los instructores están bajo actividades
    if (location.startsWith('/admin/parks') || 
        location.startsWith('/admin/amenities') || 
        location.startsWith('/admin/incidents')) return ['operations'];
    if (location.startsWith('/admin/volunteers')) return ['volunteers'];
    if (location.startsWith('/admin/finance')) return ['finance'];
    if (location.startsWith('/admin/marketing')) return ['marketing'];
    if (location.startsWith('/admin/concessions')) return ['concessions'];
    if (location.startsWith('/admin/users') || location.startsWith('/admin/permissions')) return ['users'];
    if (location.startsWith('/admin/settings')) return ['settings'];
    return []; // Ninguna sección abierta por defecto
  };
  
  const [defaultAccordion, setDefaultAccordion] = useState<string[]>(getInitialOpenSections());
  
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
              Lista
            </NavItem>
            <NavItem 
              href="/admin/permissions" 
              icon={<Shield className="h-5 w-5" />}
              active={location === '/admin/permissions'}
            >
              Permisos
            </NavItem>
          </ModuleNav>
          
          <ModuleNav 
            title="Actividades" 
            icon={<Calendar className="h-5 w-5" />}
            value="activities"
          >
            {/* Sección de Gestión de Actividades */}
            <NavItem 
              href="/admin/organizador/catalogo/ver" 
              icon={<ListFilter className="h-5 w-5" />}
              active={location.startsWith('/admin/organizador/catalogo/ver')}
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
            
            {/* Sección de Instructores */}
            <NavItem 
              href="/admin/instructors" 
              icon={<GraduationCap className="h-5 w-5" />}
              active={location === '/admin/instructors'}
            >
              Instructores
            </NavItem>
            
            {/* Sección de Reportes */}
            <NavItem 
              href="/admin/organizador" 
              icon={<FileText className="h-5 w-5" />}
              active={location.startsWith('/admin/organizador') && 
                      !location.startsWith('/admin/organizador/nueva-actividad') && 
                      !location.startsWith('/admin/organizador/catalogo')}
            >
              Reportes
            </NavItem>
          </ModuleNav>
          
          <ModuleNav 
            title="Activos" 
            icon={<Archive className="h-5 w-5" />}
            value="assets"
          >
            <NavItem 
              href="/admin/assets/categories" 
              icon={<Tag className="h-5 w-5" />}
              active={location.startsWith('/admin/assets/categories')}
            >
              Categorías
            </NavItem>
            <NavItem 
              href="/admin/assets" 
              icon={<Boxes className="h-5 w-5" />}
              active={location === '/admin/assets' || 
                     (location.startsWith('/admin/assets/') && location.includes('/admin/assets/[id]'))}
            >
              Gestión
            </NavItem>
            {/* Submenú oculto: Nuevo Activo
            <NavItem 
              href="/admin/assets/new" 
              icon={<FileText className="h-5 w-5" />}
              active={location.startsWith('/admin/assets/new')}
            >
              Nuevo Activo
            </NavItem>
            */}
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
              Mapa
            </NavItem>
            {/* Submenú oculto: Mapa Simplificado
            <NavItem 
              href="/admin/assets/map-simple" 
              icon={<MapPin className="h-5 w-5" />}
              active={location.startsWith('/admin/assets/map-simple')}
            >
              Mapa Simplificado
            </NavItem>
            */}
            {/* Submenú oculto: Calendario de Mantenimiento
            <NavItem 
              href="/admin/assets/maintenance-calendar" 
              icon={<CalendarDays className="h-5 w-5" />}
              active={location.startsWith('/admin/assets/maintenance-calendar')}
            >
              Calendario de Mantenimiento
            </NavItem>
            */}
            {/* Submenú oculto: Programar Mantenimiento
            <NavItem 
              href="/admin/assets/schedule-maintenance" 
              icon={<Calendar className="h-5 w-5" />}
              active={location.startsWith('/admin/assets/schedule-maintenance')}
            >
              Programar Mantenimiento
            </NavItem>
            */}
            {/* Submenú oculto: Asignar Responsable
            <NavItem 
              href="/admin/assets/assign-manager" 
              icon={<User className="h-5 w-5" />}
              active={location.startsWith('/admin/assets/assign-manager')}
            >
              Asignar Responsable
            </NavItem>
            */}
            {/* Submenú oculto: Asignar Equipamiento
            <NavItem 
              href="/admin/assets/assign-equipment" 
              icon={<Box className="h-5 w-5" />}
              active={location.startsWith('/admin/assets/assign-equipment')}
            >
              Asignar Equipamiento
            </NavItem>
            */}
            {/* Submenú eliminado: Reportar Incidencia
            <NavItem 
              href="/admin/assets/report-issue" 
              icon={<Bell className="h-5 w-5" />}
              active={location.startsWith('/admin/assets/report-issue')}
            >
              Reportar Incidencia
            </NavItem>
            */}
            <NavItem 
              href="/admin/assets/dashboard" 
              icon={<BarChart className="h-5 w-5" />}
              active={location.startsWith('/admin/assets/dashboard')}
            >
              Dashboard
            </NavItem>
          </ModuleNav>
          
          <ModuleNav 
            title="Arbolado" 
            icon={<Flower2 className="h-5 w-5" />}
            value="trees"
          >
            <NavItem 
              href="/admin/trees/catalog" 
              icon={<ListChecks className="h-5 w-5" />}
              active={location.startsWith('/admin/trees/catalog')}
            >
              Catálogo
            </NavItem>
            <NavItem 
              href="/admin/trees/inventory" 
              icon={<Package className="h-5 w-5" />}
              active={location.startsWith('/admin/trees/inventory')}
            >
              Inventario
            </NavItem>
            <NavItem 
              href="/admin/trees/map" 
              icon={<Map className="h-5 w-5" />}
              active={location.startsWith('/admin/trees/map')}
            >
              Mapa
            </NavItem>
            <NavItem 
              href="/admin/trees/technical" 
              icon={<AlertTriangle className="h-5 w-5" />}
              active={location.startsWith('/admin/trees/technical')}
            >
              Gestión Técnica
            </NavItem>
            <NavItem 
              href="/admin/trees/environmental" 
              icon={<Leaf className="h-5 w-5" />}
              active={location.startsWith('/admin/trees/environmental')}
            >
              Gestión Ambiental
            </NavItem>
            <NavItem 
              href="/admin/trees/maintenance" 
              icon={<Scissors className="h-5 w-5" />}
              active={location.startsWith('/admin/trees/maintenance')}
            >
              Mantenimiento
            </NavItem>
            <NavItem 
              href="/admin/trees/reports" 
              icon={<FileText className="h-5 w-5" />}
              active={location.startsWith('/admin/trees/reports')}
            >
              Reportes
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
              active={location.startsWith('/admin/parks') && 
                    !location.startsWith('/admin/parks-import') && 
                    !location.startsWith('/admin/park-edit')}
            >
              Parques
            </NavItem>
            {/* Submenú oculto: Edición de Parques
            <NavItem 
              href="/admin/park-edit" 
              icon={<FileText className="h-5 w-5" />}
              active={location.startsWith('/admin/park-edit')}
            >
              Edición de Parques
            </NavItem>
            */}
            {/* Submenú oculto: Importar Parques
            <NavItem 
              href="/admin/parks-import" 
              icon={<Upload className="h-5 w-5" />}
              active={location.startsWith('/admin/parks-import')}
            >
              Importar Parques
            </NavItem>
            */}
            <NavItem 
              href="/admin/amenities" 
              icon={<Tag className="h-5 w-5" />}
              active={location.startsWith('/admin/amenities')}
            >
              Amenidades
            </NavItem>
            <ModuleNav 
              title="Incidencias" 
              icon={<Bell className="h-5 w-5" />}
              value="incidents"
              defaultOpen={location.startsWith('/admin/incidents')}
            >
              <NavItem 
                href="/admin/incidents" 
                icon={<FileText className="h-5 w-5" />}
                active={location === '/admin/incidents' || (location.startsWith('/admin/incidents/') && location.includes('/admin/incidents/[id]'))}
              >
                Listado
              </NavItem>
              <NavItem 
                href="/admin/incidents/categories" 
                icon={<Tag className="h-5 w-5" />}
                active={location.startsWith('/admin/incidents/categories')}
              >
                Categorías
              </NavItem>
              <NavItem 
                href="/admin/incidents/dashboard" 
                icon={<BarChart className="h-5 w-5" />}
                active={location.startsWith('/admin/incidents/dashboard') || 
                       location.startsWith('/admin/dashboard-incidencias') || 
                       location.startsWith('/admin/incidentes-dashboard')}
              >
                Dashboard
              </NavItem>
            </ModuleNav>
          </ModuleNav>
          
          <ModuleNav 
            title="Finanzas" 
            icon={<DollarSign className="h-5 w-5" />}
            value="finances"
          >
            <NavItem 
              href="/admin/finances/income" 
              icon={<TrendingUp className="h-5 w-5" />}
              active={location.startsWith('/admin/finances/income')}
            >
              Ingresos
            </NavItem>
            <NavItem 
              href="/admin/finances/expenses" 
              icon={<TrendingDown className="h-5 w-5" />}
              active={location.startsWith('/admin/finances/expenses')}
            >
              Egresos
            </NavItem>
            <NavItem 
              href="/admin/finances/flow" 
              icon={<ArrowRightLeft className="h-5 w-5" />}
              active={location.startsWith('/admin/finances/flow')}
            >
              Flujo
            </NavItem>
            <NavItem 
              href="/admin/finances/calculator" 
              icon={<Calculator className="h-5 w-5" />}
              active={location.startsWith('/admin/finances/calculator')}
            >
              Calculadora
            </NavItem>
            <NavItem 
              href="/admin/finances/reports" 
              icon={<FileText className="h-5 w-5" />}
              active={location.startsWith('/admin/finances/reports')}
            >
              Reportes
            </NavItem>
          </ModuleNav>
          
          <ModuleNav 
            title="Marketing" 
            icon={<Megaphone className="h-5 w-5" />}
            value="marketing"
          >
            <NavItem 
              href="/admin/marketing/events" 
              icon={<CalendarDays className="h-5 w-5" />}
              active={location.startsWith('/admin/marketing/events')}
            >
              Eventos
            </NavItem>
            <NavItem 
              href="/admin/marketing/sponsors" 
              icon={<Handshake className="h-5 w-5" />}
              active={location.startsWith('/admin/marketing/sponsors')}
            >
              Patrocinios
            </NavItem>
            <NavItem 
              href="/admin/marketing/reports" 
              icon={<FileText className="h-5 w-5" />}
              active={location.startsWith('/admin/marketing/reports')}
            >
              Reportes
            </NavItem>
          </ModuleNav>
          
          <ModuleNav 
            title="Concesiones" 
            icon={<Store className="h-5 w-5" />}
            value="concessions"
          >
            <NavItem 
              href="/admin/concessions/catalog" 
              icon={<ListChecks className="h-5 w-5" />}
              active={location.startsWith('/admin/concessions/catalog')}
            >
              Catálogo
            </NavItem>
            <NavItem 
              href="/admin/concessions/contracts" 
              icon={<FileText className="h-5 w-5" />}
              active={location.startsWith('/admin/concessions/contracts')}
            >
              Contratos
            </NavItem>
            <NavItem 
              href="/admin/concessions/concessionaires" 
              icon={<Building className="h-5 w-5" />}
              active={location.startsWith('/admin/concessions/concessionaires')}
            >
              Concesionarios
            </NavItem>
            <NavItem 
              href="/admin/concessions/payments" 
              icon={<CreditCard className="h-5 w-5" />}
              active={location.startsWith('/admin/concessions/payments')}
            >
              Pagos
            </NavItem>
            <NavItem 
              href="/admin/concessions/control" 
              icon={<ClipboardCheck className="h-5 w-5" />}
              active={location.startsWith('/admin/concessions/control')}
            >
              Control
            </NavItem>
            <NavItem 
              href="/admin/concessions/reports" 
              icon={<FileText className="h-5 w-5" />}
              active={location.startsWith('/admin/concessions/reports')}
            >
              Reportes
            </NavItem>
          </ModuleNav>
          
          <ModuleNav 
            title="Voluntarios" 
            icon={<Users className="h-5 w-5" />}
            value="volunteers"
          >
            <NavItem 
              href="/admin/volunteers" 
              icon={<Users className="h-5 w-5" />}
              active={location === '/admin/volunteers'}
            >
              Gestión de Voluntarios
            </NavItem>
            {/* La opción de "Nuevo Voluntario" ha sido eliminada ya que ahora se gestiona desde el módulo de Usuarios */}
            {/* La opción de "Editar Voluntario" ha sido eliminada ya que ahora se gestiona desde el módulo de Usuarios */}
            {/* La opción de "Convertir Usuario" ha sido eliminada ya que ahora se gestiona desde el módulo de Usuarios */}
            <NavItem 
              href="/admin/volunteers/participations" 
              icon={<Calendar className="h-5 w-5" />}
              active={location === '/admin/volunteers/participations'}
            >
              Participaciones
            </NavItem>
            <NavItem 
              href="/admin/volunteers/evaluations" 
              icon={<Clipboard className="h-5 w-5" />}
              active={location === '/admin/volunteers/evaluations'}
            >
              Evaluaciones
            </NavItem>
            <NavItem 
              href="/admin/volunteers/recognitions" 
              icon={<Award className="h-5 w-5" />}
              active={location === '/admin/volunteers/recognitions'}
            >
              Reconocimientos
            </NavItem>
            <NavItem 
              href="/admin/volunteers/dashboard" 
              icon={<BarChart className="h-5 w-5" />}
              active={location === '/admin/volunteers/dashboard'}
            >
              Dashboard
            </NavItem>
            <NavItem 
              href="/admin/volunteers/settings" 
              icon={<Settings className="h-5 w-5" />}
              active={location === '/admin/volunteers/settings'}
            >
              Configuración
            </NavItem>
          </ModuleNav>
          
          <ModuleNav 
            title="Análisis y Reportes" 
            icon={<BarChart className="h-5 w-5" />}
            value="analytics"
          >
            <NavItem 
              href="/admin/analytics" 
              icon={<BarChart className="h-5 w-5" />}
              active={location === '/admin/analytics'}
            >
              Análisis y Reportes
            </NavItem>
            <NavItem 
              href="/admin/settings" 
              icon={<Settings className="h-5 w-5" />}
              active={location === '/admin/settings'}
            >
              Configuración
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