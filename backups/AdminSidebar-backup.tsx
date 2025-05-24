// BACKUP CREADO EL 24-05-2025
// Este archivo es una copia de seguridad del componente AdminSidebar.tsx con todos los cambios aplicados

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
  DollarSign,
  BriefcaseBusiness,
  BadgePercent,
  TrendingUp,
  CreditCard as CreditCardIcon,
  Calculator,
  CircleDollarSign,
  Store,
  Newspaper,
  Megaphone,
  Handshake,
  FolderClosed,
  Award,
  CalendarDays,
  BarChart as ChartIcon,
  Gauge,
  PieChart,
  Clipboard,
  FileText as Document,
  Wrench,
  ListChecks
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
        <svg className="h-8 w-8 text-primary" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
        <h1 className="text-xl font-bold text-primary ml-2">ParquesMX</h1>
      </div>
      <ScrollArea className="flex-1 py-2">
        <Accordion type="multiple" defaultValue={defaultAccordion} className="px-4">
          <ModuleNav 
            title="Dashboard" 
            icon={<Home className="h-5 w-5" />}
            value="dashboard"
          >
            <NavItem 
              href="/admin" 
              icon={<PieChart className="h-5 w-5" />}
              active={location === '/admin'}
            >
              General
            </NavItem>
            <NavItem 
              href="/admin/analytics" 
              icon={<ChartIcon className="h-5 w-5" />}
              active={location === '/admin/analytics'}
            >
              Analítica
            </NavItem>
          </ModuleNav>
          
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
            <NavItem 
              href="/admin/activities/reports" 
              icon={<FileText className="h-5 w-5" />}
              active={location.startsWith('/admin/activities/reports')}
            >
              Reportes
            </NavItem>
            
            {/* Subsección de Instructores */}
            <ModuleNav 
              title="Instructores" 
              icon={<Users className="h-5 w-5" />}
              value="instructors"
            >
              <NavItem 
                href="/admin/instructors" 
                icon={<User className="h-5 w-5" />}
                active={location === '/admin/instructors'}
              >
                Listado
              </NavItem>
              <NavItem 
                href="/admin/instructors/cards" 
                icon={<ListFilter className="h-5 w-5" />}
                active={location === '/admin/instructors/cards'}
              >
                Tarjetas
              </NavItem>
              <NavItem 
                href="/admin/instructors/evaluations" 
                icon={<Clipboard className="h-5 w-5" />}
                active={location.startsWith('/admin/instructors/evaluations')}
              >
                Evaluaciones
              </NavItem>
            </ModuleNav>
          </ModuleNav>

          <ModuleNav 
            title="Activos" 
            icon={<Package className="h-5 w-5" />}
            value="assets"
          >
            <NavItem 
              href="/admin/assets" 
              icon={<Package className="h-5 w-5" />}
              active={(location === '/admin/assets') || 
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
              href="/admin/assets/categories" 
              icon={<Boxes className="h-5 w-5" />}
              active={location.startsWith('/admin/assets/categories')}
            >
              Categorías
            </NavItem>
            <NavItem 
              href="/admin/assets/dashboard" 
              icon={<ChartIcon className="h-5 w-5" />}
              active={location.startsWith('/admin/assets/dashboard')}
            >
              Dashboard
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
              active={location === '/admin/parks'}
            >
              Parques
            </NavItem>
            <NavItem 
              href="/admin/amenities" 
              icon={<ListChecks className="h-5 w-5" />}
              active={location === '/admin/amenities'}
            >
              Amenidades
            </NavItem>
            
            {/* Subsección de Incidencias como submenú */}
            <ModuleNav 
              title="Incidencias" 
              icon={<Bell className="h-5 w-5" />}
              value="incidents"
            >
              <NavItem 
                href="/admin/incidents" 
                icon={<Bell className="h-5 w-5" />}
                active={location === '/admin/incidents'}
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
              icon={<CreditCardIcon className="h-5 w-5" />}
              active={location.startsWith('/admin/finances/expenses')}
            >
              Egresos
            </NavItem>
            <NavItem 
              href="/admin/finances/flow" 
              icon={<CircleDollarSign className="h-5 w-5" />}
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
              icon={<Calendar className="h-5 w-5" />}
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
            title="Configuración" 
            icon={<Settings className="h-5 w-5" />}
            value="settings"
          >
            <NavItem 
              href="/admin/settings" 
              icon={<Settings className="h-5 w-5" />}
              active={location === '/admin/settings'}
            >
              General
            </NavItem>
            <NavItem 
              href="/admin/settings/profile" 
              icon={<User className="h-5 w-5" />}
              active={location === '/admin/settings/profile'}
            >
              Perfil
            </NavItem>
            <NavItem 
              href="/admin/settings/municipality" 
              icon={<Building className="h-5 w-5" />}
              active={location === '/admin/settings/municipality'}
            >
              Municipio
            </NavItem>
          </ModuleNav>
        </Accordion>
      </ScrollArea>
      <div className="p-4">
        <Separator className="my-2" />
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center">
            <User className="h-6 w-6 text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">Admin</span>
          </div>
          <Link href="/logout">
            <Button variant="ghost" size="icon">
              <LogOut className="h-5 w-5 text-muted-foreground" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;