import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import UserProfileImage from '@/components/UserProfileImage';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
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
  BarChart3,
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
  Boxes,
  Box,
  CalendarDays,
  CircleDollarSign,
  MapPin,
  GraduationCap,
  Award,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Target,
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
  Scissors,
  TreePine,
  HardHat,
  Camera,
  Heart,
  AlertCircle,
  AlertTriangle,
  Database,
  Lock,
  Leaf,
  HeartHandshake,
  Star,
  ClipboardList,
  PersonStanding,
  UserCheck,
  Activity,
  Banknote,
  PieChart,
  Receipt,
  Wallet,
  ChevronsUpDown,
  ChevronDown,
  Wrench,
  Archive,
  FileEdit,
  Briefcase,
  UserCog,
  Zap,
  Book
} from 'lucide-react';

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

const NavItem: React.FC<NavItemProps> = ({ href, icon, children, active }) => {
  const iconWithClass = React.cloneElement(icon as React.ReactElement, {
    className: cn((icon as React.ReactElement).props.className, 'menu-icon')
  });

  return (
    <Link href={href}>
      <Button
        variant={active ? "secondary" : "ghost"}
        className={cn(
          "w-full justify-start text-sm font-normal h-9",
          active && "bg-primary/10 text-primary font-medium"
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

// Sidebar para Administrador (acceso completo)
const AdminSidebarContent: React.FC<{ location: string; defaultAccordion: string[] }> = ({ location, defaultAccordion }) => (
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
      title="Sistema" 
      icon={<Settings className="h-5 w-5" />}
      value="system"
    >
      <NavItem 
        href="/admin/settings" 
        icon={<Settings className="h-5 w-5" />}
        active={location === '/admin/settings'}
      >
        Configuración
      </NavItem>
      <NavItem 
        href="/admin/users" 
        icon={<UserCheck className="h-5 w-5" />}
        active={location === '/admin/users'}
      >
        Gestión de Usuarios
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
      title="Parques" 
      icon={<Map className="h-5 w-5" />}
      value="parks"
    >
      <NavItem 
        href="/admin/parks" 
        icon={<Map className="h-5 w-5" />}
        active={location === '/admin/parks'}
      >
        Gestión
      </NavItem>
    </ModuleNav>

    <ModuleNav 
      title="Amenidades" 
      icon={<Package className="h-5 w-5" />}
      value="amenities"
    >
      <NavItem 
        href="/admin/amenities-dashboard" 
        icon={<BarChart className="h-5 w-5" />}
        active={location === '/admin/amenities-dashboard'}
      >
        Dashboard
      </NavItem>
      <NavItem 
        href="/admin/amenities" 
        icon={<Package className="h-5 w-5" />}
        active={location === '/admin/amenities'}
      >
        Gestión
      </NavItem>
    </ModuleNav>

    <ModuleNav 
      title="Incidencias" 
      icon={<AlertTriangle className="h-5 w-5" />}
      value="incidents"
    >
      <NavItem 
        href="/admin/incidents" 
        icon={<ClipboardList className="h-5 w-5" />}
        active={location === '/admin/incidents'}
      >
        Listado
      </NavItem>
      <NavItem 
        href="/admin/incidents/categories" 
        icon={<Tag className="h-5 w-5" />}
        active={location === '/admin/incidents/categories'}
      >
        Categorías
      </NavItem>
    </ModuleNav>

    <ModuleNav 
      title="Activos" 
      icon={<Package className="h-5 w-5" />}
      value="assets"
    >
      <NavItem 
        href="/admin/assets" 
        icon={<Package className="h-5 w-5" />}
        active={location === '/admin/assets'}
      >
        Gestión
      </NavItem>
      <NavItem 
        href="/admin/assets/inventory" 
        icon={<Archive className="h-5 w-5" />}
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
      <NavItem 
        href="/admin/assets/maintenance" 
        icon={<Wrench className="h-5 w-5" />}
        active={location.startsWith('/admin/assets/maintenance')}
      >
        Mantenimiento
      </NavItem>
      <NavItem 
        href="/admin/assets/assignments" 
        icon={<UserCheck className="h-5 w-5" />}
        active={location.startsWith('/admin/assets/assignments')}
      >
        Asignaciones
      </NavItem>
    </ModuleNav>

    <ModuleNav 
      title="Finanzas" 
      icon={<DollarSign className="h-5 w-5" />}
      value="finance"
    >
      <NavItem 
        href="/admin/finance/catalog" 
        icon={<Tag className="h-5 w-5" />}
        active={location === '/admin/finance/catalog'}
      >
        Catálogo
      </NavItem>
      <NavItem 
        href="/admin/finance/incomes" 
        icon={<TrendingUp className="h-5 w-5" />}
        active={location === '/admin/finance/incomes'}
      >
        Ingresos
      </NavItem>
      <NavItem 
        href="/admin/finance/expenses" 
        icon={<TrendingDown className="h-5 w-5" />}
        active={location === '/admin/finance/expenses'}
      >
        Egresos
      </NavItem>
      <NavItem 
        href="/admin/finance/cashflow" 
        icon={<CircleDollarSign className="h-5 w-5" />}
        active={location === '/admin/finance/cashflow'}
      >
        Flujo
      </NavItem>
      <NavItem 
        href="/admin/finance/cash-flow-matrix" 
        icon={<LayoutGrid className="h-5 w-5" />}
        active={location === '/admin/finance/cash-flow-matrix'}
      >
        Matriz de Flujo
      </NavItem>
      <NavItem 
        href="/admin/finance/calculator" 
        icon={<Calculator className="h-5 w-5" />}
        active={location === '/admin/finance/calculator'}
      >
        Calculadora
      </NavItem>
      <NavItem 
        href="/admin/finance/reports" 
        icon={<FileText className="h-5 w-5" />}
        active={location === '/admin/finance/reports'}
      >
        Reportes
      </NavItem>
      <NavItem 
        href="/admin/finance/dashboard" 
        icon={<BarChart className="h-5 w-5" />}
        active={location === '/admin/finance/dashboard'}
      >
        Dashboard
      </NavItem>
    </ModuleNav>

    <ModuleNav 
      title="Eventos" 
      icon={<CalendarDays className="h-5 w-5" />}
      value="events"
    >
      <NavItem 
        href="/admin/events" 
        icon={<ListFilter className="h-5 w-5" />}
        active={location.startsWith('/admin/events') && !location.startsWith('/admin/events/new')}
      >
        Listado
      </NavItem>
      <NavItem 
        href="/admin/events/new" 
        icon={<Upload className="h-5 w-5" />}
        active={location.startsWith('/admin/events/new')}
      >
        Nuevo Evento
      </NavItem>
      <NavItem 
        href="/admin/events/calendar" 
        icon={<Calendar className="h-5 w-5" />}
        active={location.startsWith('/admin/events/calendar')}
      >
        Calendario
      </NavItem>
    </ModuleNav>

    <ModuleNav 
      title="Actividades" 
      icon={<Calendar className="h-5 w-5" />}
      value="activities"
    >
      <NavItem 
        href="/admin/activities" 
        icon={<Activity className="h-5 w-5" />}
        active={location === '/admin/activities'}
      >
        Listado
      </NavItem>
      <NavItem 
        href="/admin/instructors" 
        icon={<GraduationCap className="h-5 w-5" />}
        active={location === '/admin/instructors'}
      >
        Instructores
      </NavItem>
    </ModuleNav>

    <ModuleNav 
      title="Marketing" 
      icon={<Megaphone className="h-5 w-5" />}
      value="marketing"
    >
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
        href="/admin/concessions/control" 
        icon={<Shield className="h-5 w-5" />}
        active={location.startsWith('/admin/concessions/control')}
      >
        Control
      </NavItem>
      <NavItem 
        href="/admin/concessions/reports" 
        icon={<BarChart className="h-5 w-5" />}
        active={location.startsWith('/admin/concessions/reports')}
      >
        Reportes
      </NavItem>
    </ModuleNav>

    <ModuleNav 
      title="Recursos Humanos" 
      icon={<Users className="h-5 w-5" />}
      value="hr"
    >
      <NavItem 
        href="/admin/hr/employees" 
        icon={<User className="h-5 w-5" />}
        active={location.startsWith('/admin/hr/employees')}
      >
        Personal
      </NavItem>
      <NavItem 
        href="/admin/hr/training" 
        icon={<GraduationCap className="h-5 w-5" />}
        active={location.startsWith('/admin/hr/training')}
      >
        Capacitación
      </NavItem>
      <NavItem 
        href="/admin/hr/payroll" 
        icon={<CreditCard className="h-5 w-5" />}
        active={location.startsWith('/admin/hr/payroll')}
      >
        Nómina
      </NavItem>
      <NavItem 
        href="/admin/hr/wellness" 
        icon={<Award className="h-5 w-5" />}
        active={location.startsWith('/admin/hr/wellness')}
      >
        Bienestar
      </NavItem>
      <NavItem 
        href="/admin/hr/analytics" 
        icon={<BarChart className="h-5 w-5" />}
        active={location.startsWith('/admin/hr/analytics')}
      >
        Analytics
      </NavItem>
    </ModuleNav>

    <ModuleNav 
      title="Arbolado" 
      icon={<TreePine className="h-5 w-5" />}
      value="trees"
    >
      <NavItem 
        href="/admin/trees/inventory" 
        icon={<Database className="h-5 w-5" />}
        active={location.startsWith('/admin/trees/inventory')}
      >
        Inventario
      </NavItem>
      <NavItem 
        href="/admin/trees/catalog" 
        icon={<Book className="h-5 w-5" />}
        active={location.startsWith('/admin/trees/catalog')}
      >
        Catálogo
      </NavItem>
      <NavItem 
        href="/admin/trees/species" 
        icon={<Leaf className="h-5 w-5" />}
        active={location.startsWith('/admin/trees/species')}
      >
        Especies
      </NavItem>
      <NavItem 
        href="/admin/trees/maintenance" 
        icon={<Wrench className="h-5 w-5" />}
        active={location.startsWith('/admin/trees/maintenance')}
      >
        Mantenimiento
      </NavItem>
      <NavItem 
        href="/admin/trees/health" 
        icon={<HeartHandshake className="h-5 w-5" />}
        active={location.startsWith('/admin/trees/health')}
      >
        Estado Sanitario
      </NavItem>
      <NavItem 
        href="/admin/trees/environmental" 
        icon={<Flower2 className="h-5 w-5" />}
        active={location.startsWith('/admin/trees/environmental')}
      >
        Gestión Ambiental
      </NavItem>
      <NavItem 
        href="/admin/trees/technical" 
        icon={<HardHat className="h-5 w-5" />}
        active={location.startsWith('/admin/trees/technical')}
      >
        Gestión Técnica
      </NavItem>
      <NavItem 
        href="/admin/trees/reports" 
        icon={<FileText className="h-5 w-5" />}
        active={location.startsWith('/admin/trees/reports')}
      >
        Reportes
      </NavItem>
    </ModuleNav>



  </Accordion>
);

// Sidebar para Director (gestión estratégica)
const DirectorSidebar: React.FC<{ location: string; defaultAccordion: string[] }> = ({ location, defaultAccordion }) => (
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
      title="Finanzas" 
      icon={<DollarSign className="h-5 w-5" />}
      value="finance"
    >
      <NavItem 
        href="/admin/finance/catalog" 
        icon={<Tag className="h-5 w-5" />}
        active={location === '/admin/finance/catalog'}
      >
        Catálogo
      </NavItem>
      <NavItem 
        href="/admin/finance/incomes" 
        icon={<TrendingUp className="h-5 w-5" />}
        active={location === '/admin/finance/incomes'}
      >
        Ingresos
      </NavItem>
      <NavItem 
        href="/admin/finance/expenses" 
        icon={<TrendingDown className="h-5 w-5" />}
        active={location === '/admin/finance/expenses'}
      >
        Egresos
      </NavItem>
    </ModuleNav>

    <ModuleNav 
      title="Operaciones" 
      icon={<MapPin className="h-5 w-5" />}
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
        href="/admin/incidents" 
        icon={<AlertCircle className="h-5 w-5" />}
        active={location === '/admin/incidents'}
      >
        Incidentes
      </NavItem>
    </ModuleNav>

    <NavItem 
      href="/admin/users" 
      icon={<Users className="h-5 w-5" />}
      active={location === '/admin/users'}
    >
      Personal
    </NavItem>

    {/* Opción de perfil personal para todos los usuarios */}
    <NavItem 
      href="/admin/settings/profile" 
      icon={<User className="h-5 w-5" />}
      active={location.startsWith('/admin/settings/profile')}
    >
      Mi perfil
    </NavItem>
  </Accordion>
);

// Sidebar para Manager (gestión operativa)
const ManagerSidebar: React.FC<{ location: string; defaultAccordion: string[] }> = ({ location, defaultAccordion }) => (
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
      title="Operaciones" 
      icon={<MapPin className="h-5 w-5" />}
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
        href="/admin/assets" 
        icon={<Box className="h-5 w-5" />}
        active={location === '/admin/assets'}
      >
        Activos
      </NavItem>
      <NavItem 
        href="/admin/incidents" 
        icon={<AlertCircle className="h-5 w-5" />}
        active={location === '/admin/incidents'}
      >
        Incidentes
      </NavItem>
    </ModuleNav>

    <ModuleNav 
      title="Actividades" 
      icon={<Calendar className="h-5 w-5" />}
      value="activities"
    >
      <NavItem 
        href="/admin/activities" 
        icon={<Activity className="h-5 w-5" />}
        active={location === '/admin/activities'}
      >
        Listado
      </NavItem>
      <NavItem 
        href="/admin/instructors" 
        icon={<GraduationCap className="h-5 w-5" />}
        active={location === '/admin/instructors'}
      >
        Instructores
      </NavItem>
    </ModuleNav>

    <NavItem 
      href="/admin/users" 
      icon={<Users className="h-5 w-5" />}
      active={location === '/admin/users'}
    >
      Personal
    </NavItem>

    <NavItem 
      href="/admin/settings/profile" 
      icon={<User className="h-5 w-5" />}
      active={location === '/admin/settings/profile'}
    >
      Mi perfil
    </NavItem>
  </Accordion>
);

// Sidebar para Instructor (gestión de actividades)
const InstructorSidebar: React.FC<{ location: string; defaultAccordion: string[] }> = ({ location, defaultAccordion }) => (
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
      title="Mis Actividades" 
      icon={<Calendar className="h-5 w-5" />}
      value="activities"
    >
      <NavItem 
        href="/admin/activities" 
        icon={<Activity className="h-5 w-5" />}
        active={location === '/admin/activities'}
      >
        Listado
      </NavItem>
    </ModuleNav>

    <NavItem 
      href="/admin/settings/profile" 
      icon={<User className="h-5 w-5" />}
      active={location === '/admin/settings/profile'}
    >
      Mi Perfil
    </NavItem>
  </Accordion>
);

// Sidebar para Supervisor (supervisión y reportes)
const SupervisorSidebar: React.FC<{ location: string; defaultAccordion: string[] }> = ({ location, defaultAccordion }) => (
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
      title="Supervisión" 
      icon={<MapPin className="h-5 w-5" />}
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
        href="/admin/incidents" 
        icon={<AlertCircle className="h-5 w-5" />}
        active={location === '/admin/incidents'}
      >
        Incidentes
      </NavItem>
    </ModuleNav>

    <NavItem 
      href="/admin/activities" 
      icon={<Calendar className="h-5 w-5" />}
      active={location === '/admin/activities'}
    >
      Actividades
    </NavItem>

    <NavItem 
      href="/admin/settings/profile" 
      icon={<User className="h-5 w-5" />}
      active={location === '/admin/settings/profile'}
    >
      Mi perfil
    </NavItem>
  </Accordion>
);

// Componente principal que selecciona el sidebar según el rol
const RoleBasedSidebar: React.FC = () => {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  
  // Determinar qué sección debe estar abierta basado en la URL actual
  const getInitialOpenSections = () => {
    if (location.startsWith('/admin/assets')) return ['assets'];
    if (location.startsWith('/admin/activities')) return ['activities'];
    if (location.startsWith('/admin/instructors')) return ['activities'];
    if (location.startsWith('/admin/parks') || 
        location.startsWith('/admin/assets') || 
        location.startsWith('/admin/incidents')) return ['operations'];
    if (location.startsWith('/admin/volunteers')) return ['volunteers'];
    if (location.startsWith('/admin/finance')) return ['finance'];
    if (location.startsWith('/admin/events')) return ['events'];
    if (location.startsWith('/admin/marketing')) return ['marketing'];
    if (location.startsWith('/admin/concessions')) return ['concessions'];
    if (location.startsWith('/admin/users') || location.startsWith('/admin/permissions')) return ['users'];
    if (location.startsWith('/admin/settings')) return ['settings'];
    return [];
  };
  
  const [defaultAccordion, setDefaultAccordion] = useState<string[]>(getInitialOpenSections());
  
  // Función para obtener el sidebar según el rol
  const getSidebarForRole = () => {
    const role = (user as any)?.role;
    
    switch (role) {
      case 'admin':
        return <AdminSidebarContent location={location} defaultAccordion={defaultAccordion} />;
      case 'director':
        return <DirectorSidebar location={location} defaultAccordion={defaultAccordion} />;
      case 'manager':
        return <ManagerSidebar location={location} defaultAccordion={defaultAccordion} />;
      case 'instructor':
        return <InstructorSidebar location={location} defaultAccordion={defaultAccordion} />;
      case 'supervisor':
        return <SupervisorSidebar location={location} defaultAccordion={defaultAccordion} />;
      default:
        // Por defecto, mostrar un sidebar básico
        return <InstructorSidebar location={location} defaultAccordion={defaultAccordion} />;
    }
  };
  
  return (
    <div className="h-screen border-r bg-white flex flex-col">
      <div className="p-4 flex items-center">
        <svg className="h-8 w-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
          <path d="M5 16c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm0-8c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm4 8c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm0-8c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm7.5-4c.28 0 .5.22.5.5s-.22.5-.5.5-.5-.22-.5-.5.22-.5.5-.5zM5 12c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm7 0c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm1-8.5c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5zM17 12c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm2-5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm0 8c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm-7-10c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm0 8c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm-4-8c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"></path>
        </svg>
        <div className="ml-2 flex flex-col">
          <h1 className="text-xl font-heading font-semibold text-gray-900">
            ParquesMX
          </h1>
          <span className="text-xs text-gray-500 capitalize">
            Panel {(user as any)?.role || 'Usuario'}
          </span>
        </div>
      </div>
      
      <Separator />
      
      <ScrollArea className="flex-1 py-2">
        {getSidebarForRole()}
      </ScrollArea>
      
      <Separator />
      
      <div className="p-3">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
          {(user as any)?.profileImageUrl ? (
            <img 
              src={(user as any).profileImageUrl}
              alt="Foto de perfil"
              className="h-8 w-8 rounded-full object-cover border border-gray-200"
              onError={(e) => {
                // Si la imagen falla, mostrar el avatar con inicial
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLDivElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
          ) : null}
          <div 
            className={`h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium ${(user as any)?.profileImageUrl ? 'hidden' : ''}`}
          >
            {((user as any)?.fullName || (user as any)?.firstName || 'U')[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {(user as any)?.fullName || `${(user as any)?.firstName} ${(user as any)?.lastName}`}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {(user as any)?.role}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="h-8 w-8 p-0"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RoleBasedSidebar;