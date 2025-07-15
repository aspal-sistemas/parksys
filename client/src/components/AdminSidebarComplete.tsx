import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import UserProfileImage from '@/components/UserProfileImage';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useTranslation } from 'react-i18next';
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
  CalendarClock,
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
  FolderOpen,
  FolderTree,
  BookOpen,
  Scissors,
  TreePine,
  HardHat,
  Camera,
  Heart,
  AlertCircle,
  Mail,
  Clock,
  AlertTriangle,
  Database,
  Lock,
  Leaf,
  HeartHandshake,
  HandHeart,
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
  Book,
  Plus,
  Image,
  Scale
} from 'lucide-react';

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  active?: boolean;
  moduleColor?: string;
}

interface ModuleNavProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  value: string;
  defaultOpen?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ href, icon, children, active, moduleColor }) => {
  const iconWithClass = React.cloneElement(icon as React.ReactElement, {
    className: cn((icon as React.ReactElement).props.className, 'menu-icon', moduleColor)
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
  // Define color schemes for each module
  const getModuleColors = (moduleValue: string) => {
    const colorSchemes = {
      'system': {
        iconColor: 'text-emerald-600',
        textColor: 'text-emerald-700',
        hoverBg: 'hover:bg-emerald-50'
      },
      'gestion': {
        iconColor: 'text-green-600',
        textColor: 'text-green-700', 
        hoverBg: 'hover:bg-green-50'
      },
      'operations': {
        iconColor: 'text-teal-600',
        textColor: 'text-teal-700',
        hoverBg: 'hover:bg-teal-50'
      },
      'admin-finance': {
        iconColor: 'text-cyan-600',
        textColor: 'text-cyan-700',
        hoverBg: 'hover:bg-cyan-50'
      },
      'marketing': {
        iconColor: 'text-lime-600',
        textColor: 'text-lime-700',
        hoverBg: 'hover:bg-lime-50'
      },
      'hr': {
        iconColor: 'text-emerald-700',
        textColor: 'text-emerald-800',
        hoverBg: 'hover:bg-emerald-50'
      },
      'security': {
        iconColor: 'text-slate-600',
        textColor: 'text-slate-700',
        hoverBg: 'hover:bg-slate-50'
      }
    };
    
    return colorSchemes[moduleValue] || {
      iconColor: 'text-gray-600',
      textColor: 'text-gray-700',
      hoverBg: 'hover:bg-gray-50'
    };
  };

  const colors = getModuleColors(value);
  
  const iconWithClass = React.cloneElement(icon as React.ReactElement, {
    className: cn((icon as React.ReactElement).props.className, 'menu-icon', colors.iconColor)
  });

  return (
    <AccordionItem value={value} className="border-0">
      <AccordionTrigger className={cn("py-2 hover:no-underline", colors.hoverBg)}>
        <div className={cn("flex items-center text-sm font-medium", colors.textColor)}>
          <div className="mr-2">{iconWithClass}</div>
          {title}
        </div>
      </AccordionTrigger>
      <AccordionContent className="pl-2 pb-0">
        <div className="flex flex-col gap-1 pt-1" style={{ '--module-color': colors.iconColor } as any}>
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
              if (child.type === NavItem) {
                return React.cloneElement(child, { moduleColor: colors.iconColor });
              }
              // Si es un div, procesar sus hijos recursivamente
              if (child.type === 'div') {
                return React.cloneElement(child, {
                  children: React.Children.map(child.props.children, (grandChild) => {
                    if (React.isValidElement(grandChild)) {
                      if (grandChild.type === NavItem) {
                        return React.cloneElement(grandChild, { moduleColor: colors.iconColor });
                      }
                      // Si es un div con clase que contiene iconos, aplicar color
                      if (grandChild.type === 'div' && grandChild.props.className?.includes('flex items-center')) {
                        return React.cloneElement(grandChild, {
                          children: React.Children.map(grandChild.props.children, (icon) => {
                            if (React.isValidElement(icon) && icon.props.className?.includes('h-4 w-4')) {
                              return React.cloneElement(icon, {
                                className: cn(icon.props.className, colors.iconColor)
                              });
                            }
                            return icon;
                          })
                        });
                      }
                    }
                    return grandChild;
                  })
                });
              }
            }
            return child;
          })}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

const AdminSidebarComplete: React.FC = () => {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { t } = useTranslation('common');
  
  // Determinar qué módulo debe estar abierto basado en la ruta actual
  const getActiveModule = () => {
    // Rutas que pertenecen al módulo "Gestión"
    if (location.startsWith('/admin/visitors') || 
        location.startsWith('/admin/parks') || 
        location.startsWith('/admin/trees') || 
        location.startsWith('/admin/organizador') || 
        location.startsWith('/admin/activities') || 
        location.startsWith('/admin/instructors') || 
        location.startsWith('/admin/events') || 
        location.startsWith('/admin/eventos-ambu') || 
        location.startsWith('/admin/space-reservations') ||
        location.startsWith('/admin/amenities')) {
      return ['gestion'];
    }
    
    // Rutas que pertenecen al módulo "O & M"
    if (location.startsWith('/admin/assets') || location.startsWith('/admin/incidents') || location.startsWith('/admin/volunteers')) {
      return ['operations'];
    }
    
    // Rutas que pertenecen al módulo "Admin/Finanzas"
    if (location.startsWith('/admin/finance') || location.startsWith('/admin/accounting') || location.startsWith('/admin/concessions')) {
      return ['admin-finance'];
    }
    
    // Rutas que pertenecen al módulo "Mkt & Comm"
    if (location.startsWith('/admin/marketing') || location.startsWith('/admin/communications')) {
      return ['mkt-comm'];
    }
    
    // Otros módulos
    if (location.startsWith('/admin/users') || location.startsWith('/admin/permissions') || location.startsWith('/admin/settings')) return ['system'];
    if (location.startsWith('/admin/hr')) return ['hr'];
    if (location.startsWith('/admin/security')) return ['security'];
    if (location.startsWith('/admin/analytics') || location.startsWith('/admin/documents') || location.startsWith('/admin/comments')) return ['system'];
    return []; // Sin módulos abiertos por defecto
  };
  
  const defaultAccordion = getActiveModule();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <div className="fixed inset-y-0 left-0 w-64 flex flex-col bg-white shadow-lg z-50" style={{ height: '100vh' }}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Map className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-gray-900">ParkSys</h1>
            <p className="text-xs text-gray-500">Sistema de Parques</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-2 w-full">
        <Accordion
          type="multiple"
          defaultValue={defaultAccordion}
          className="space-y-1"
        >
          <NavItem 
            href="/admin" 
            icon={<Home className="h-5 w-5" />}
            active={location === '/admin'}
          >
            {t('navigation.dashboard')}
          </NavItem>

          {/* 1. CONFIGURACIÓN */}
          <ModuleNav 
            title={t('navigation.settings')} 
            icon={<Settings className="h-5 w-5" />}
            value="system"
          >
            <NavItem 
              href="/admin/settings" 
              icon={<Settings className="h-5 w-5" />}
              active={location === '/admin/settings'}
            >
              {t('navigation.settings')}
            </NavItem>
            <NavItem 
              href="/admin/users" 
              icon={<UserCheck className="h-5 w-5" />}
              active={location === '/admin/users'}
            >
              {t('navigation.users')}
            </NavItem>
            <NavItem 
              href="/admin/permissions" 
              icon={<Shield className="h-5 w-5" />}
              active={location === '/admin/permissions'}
            >
              {t('navigation.permissions')}
            </NavItem>
          </ModuleNav>

          {/* 2. GESTIÓN - MENÚ PRINCIPAL */}
          <ModuleNav 
            title="Gestión" 
            icon={<FolderOpen className="h-5 w-5" />}
            value="gestion"
            defaultOpen={location.startsWith('/admin/visitors') || location.startsWith('/admin/parks') || location.startsWith('/admin/trees') || location.startsWith('/admin/organizador') || location.startsWith('/admin/activities') || location.startsWith('/admin/events') || location.startsWith('/admin/space-reservations')}
          >
            {/* VISITANTES */}
            <div className="pl-4 border-l-2 border-gray-200 ml-2 space-y-1">
              <div className="font-medium text-sm text-gray-700 mb-2 flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Visitantes
              </div>
              <NavItem 
                href="/admin/visitors/count" 
                icon={<Users className="h-4 w-4" />}
                active={location === '/admin/visitors/count'}
              >
                Conteo de Visitantes
              </NavItem>
              <NavItem 
                href="/admin/visitors/dashboard" 
                icon={<Activity className="h-4 w-4" />}
                active={location === '/admin/visitors/dashboard'}
              >
                Dashboard de Visitantes
              </NavItem>
              <NavItem 
                href="/admin/visitors/evaluations" 
                icon={<Star className="h-4 w-4" />}
                active={location === '/admin/visitors/evaluations'}
              >
                Evaluaciones
              </NavItem>
              <NavItem 
                href="/admin/visitors/criteria" 
                icon={<Settings className="h-4 w-4" />}
                active={location === '/admin/visitors/criteria'}
              >
                Criterios de Evaluación
              </NavItem>
            </div>

            {/* PARQUES */}
            <div className="pl-4 border-l-2 border-gray-200 ml-2 space-y-1 mt-4">
              <div className="font-medium text-sm text-gray-700 mb-2 flex items-center">
                <Map className="h-4 w-4 mr-2" />
                Parques
              </div>
              <NavItem 
                href="/admin/parks/dashboard" 
                icon={<BarChart className="h-4 w-4" />}
                active={location === '/admin/parks/dashboard'}
              >
                {t('navigation.operativeSummary')}
              </NavItem>
              <NavItem 
                href="/admin/parks" 
                icon={<Map className="h-4 w-4" />}
                active={location === '/admin/parks'}
              >
                {t('navigation.management')}
              </NavItem>
            </div>

            {/* ARBOLADO */}
            <div className="pl-4 border-l-2 border-gray-200 ml-2 space-y-1 mt-4">
              <div className="font-medium text-sm text-gray-700 mb-2 flex items-center">
                <TreePine className="h-4 w-4 mr-2" />
                Arbolado
              </div>
              <NavItem 
                href="/admin/trees/inventory" 
                icon={<Archive className="h-4 w-4" />}
                active={location.startsWith('/admin/trees/inventory')}
              >
                {t('navigation.inventory')}
              </NavItem>
              <NavItem 
                href="/admin/trees/species" 
                icon={<Leaf className="h-4 w-4" />}
                active={location.startsWith('/admin/trees/species')}
              >
                {t('navigation.species')}
              </NavItem>
              <NavItem 
                href="/admin/trees/maintenance" 
                icon={<Scissors className="h-4 w-4" />}
                active={location.startsWith('/admin/trees/maintenance')}
              >
                {t('navigation.maintenance')}
              </NavItem>
            </div>

            {/* ACTIVIDADES */}
            <div className="pl-4 border-l-2 border-gray-200 ml-2 space-y-1 mt-4">
              <div className="font-medium text-sm text-gray-700 mb-2 flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Actividades
              </div>
              <NavItem 
                href="/admin/organizador" 
                icon={<BarChart3 className="h-4 w-4" />}
                active={location.startsWith('/admin/organizador')}
              >
                Dashboard
              </NavItem>
              <NavItem 
                href="/admin/activities/categories" 
                icon={<Tag className="h-4 w-4" />}
                active={location.startsWith('/admin/activities/categories')}
              >
                Categorías
              </NavItem>
              <NavItem 
                href="/admin/activities" 
                icon={<Activity className="h-4 w-4" />}
                active={location === '/admin/activities'}
              >
                {t('navigation.listing')}
              </NavItem>
              <NavItem 
                href="/admin/organizador/catalogo/crear" 
                icon={<Plus className="h-4 w-4" />}
                active={location.startsWith('/admin/organizador/catalogo/crear')}
              >
                Nueva Actividad
              </NavItem>
              <NavItem 
                href="/admin/activities/calendar" 
                icon={<Calendar className="h-4 w-4" />}
                active={location.startsWith('/admin/activities/calendar')}
              >
                Calendario
              </NavItem>
              <NavItem 
                href="/admin/instructors" 
                icon={<GraduationCap className="h-4 w-4" />}
                active={location === '/admin/instructors'}
              >
                {t('navigation.instructors')}
              </NavItem>
            </div>

            {/* EVENTOS */}
            <div className="pl-4 border-l-2 border-gray-200 ml-2 space-y-1 mt-4">
              <div className="font-medium text-sm text-gray-700 mb-2 flex items-center">
                <CalendarDays className="h-4 w-4 mr-2" />
                Eventos
              </div>
              <NavItem 
                href="/admin/events/new" 
                icon={<Plus className="h-4 w-4" />}
                active={location.startsWith('/admin/events/new')}
              >
                Nuevo Evento
              </NavItem>
              <NavItem 
                href="/admin/events/categories" 
                icon={<Tag className="h-4 w-4" />}
                active={location.startsWith('/admin/events/categories')}
              >
                Categorías
              </NavItem>
              <NavItem 
                href="/admin/eventos-ambu" 
                icon={<FileText className="h-4 w-4" />}
                active={location.startsWith('/admin/eventos-ambu')}
              >
                Eventos
              </NavItem>
              <NavItem 
                href="/admin/eventos-ambu/calendario" 
                icon={<Calendar className="h-4 w-4" />}
                active={location.startsWith('/admin/eventos-ambu/calendario')}
              >
                Calendario
              </NavItem>
              <NavItem 
                href="/admin/eventos-ambu/tabulador" 
                icon={<DollarSign className="h-4 w-4" />}
                active={location.startsWith('/admin/eventos-ambu/tabulador')}
              >
                Tabulador de Costos
              </NavItem>
            </div>

            {/* RESERVAS */}
            <div className="pl-4 border-l-2 border-gray-200 ml-2 space-y-1 mt-4">
              <div className="font-medium text-sm text-gray-700 mb-2 flex items-center">
                <CalendarClock className="h-4 w-4 mr-2" />
                Reservas
              </div>
              <NavItem 
                href="/admin/space-reservations" 
                icon={<Calendar className="h-4 w-4" />}
                active={location === '/admin/space-reservations'}
              >
                Reservas Activas
              </NavItem>
              <NavItem 
                href="/admin/space-reservations/spaces" 
                icon={<MapPin className="h-4 w-4" />}
                active={location.startsWith('/admin/space-reservations/spaces')}
              >
                Espacios Disponibles
              </NavItem>
              <NavItem 
                href="/admin/space-reservations/new" 
                icon={<Plus className="h-4 w-4" />}
                active={location.startsWith('/admin/space-reservations/new')}
              >
                Nueva Reserva
              </NavItem>
              <NavItem 
                href="/admin/space-reservations/calendar" 
                icon={<CalendarDays className="h-4 w-4" />}
                active={location.startsWith('/admin/space-reservations/calendar')}
              >
                Calendario
              </NavItem>
            </div>

            {/* AMENIDADES */}
            <div className="pl-4 border-l-2 border-gray-200 ml-2 space-y-1 mt-4">
              <div className="font-medium text-sm text-gray-700 mb-2 flex items-center">
                <Package className="h-4 w-4 mr-2" />
                Amenidades
              </div>
              <NavItem 
                href="/admin/amenities-dashboard" 
                icon={<BarChart className="h-4 w-4" />}
                active={location === '/admin/amenities-dashboard'}
              >
                {t('navigation.operativeSummary')}
              </NavItem>
              <NavItem 
                href="/admin/amenities" 
                icon={<Package className="h-4 w-4" />}
                active={location === '/admin/amenities'}
              >
                {t('navigation.management')}
              </NavItem>
            </div>
          </ModuleNav>



          {/* 3. O & M - OPERACIONES Y MANTENIMIENTO */}
          <ModuleNav 
            title="O & M" 
            icon={<Wrench className="h-5 w-5" />}
            value="operations"
            defaultOpen={location.startsWith('/admin/assets') || location.startsWith('/admin/incidents') || location.startsWith('/admin/volunteers')}
          >
            {/* ACTIVOS */}
            <div className="pl-4 border-l-2 border-gray-200 ml-2 space-y-1">
              <div className="font-medium text-sm text-gray-700 mb-2 flex items-center">
                <Package className="h-4 w-4 mr-2" />
                Activos
              </div>
              <NavItem 
                href="/admin/assets" 
                icon={<BarChart className="h-4 w-4" />}
                active={location === '/admin/assets'}
              >
                {t('navigation.operativeSummary')}
              </NavItem>
              <NavItem 
                href="/admin/assets/categories" 
                icon={<Tag className="h-4 w-4" />}
                active={location.startsWith('/admin/assets/categories')}
              >
                Categorías
              </NavItem>
              <NavItem 
                href="/admin/assets/inventory" 
                icon={<Archive className="h-4 w-4" />}
                active={location.startsWith('/admin/assets/inventory')}
              >
                {t('navigation.inventory')}
              </NavItem>
              <NavItem 
                href="/admin/assets/map" 
                icon={<Map className="h-4 w-4" />}
                active={location === '/admin/assets/map'}
              >
                {t('navigation.map')}
              </NavItem>
              <NavItem 
                href="/admin/assets/maintenance" 
                icon={<Wrench className="h-4 w-4" />}
                active={location.startsWith('/admin/assets/maintenance') && !location.includes('/calendar')}
              >
                {t('navigation.maintenance')}
              </NavItem>
              <NavItem 
                href="/admin/assets/maintenance/calendar" 
                icon={<Calendar className="h-4 w-4" />}
                active={location.startsWith('/admin/assets/maintenance/calendar')}
              >
                Calendario
              </NavItem>
              <NavItem 
                href="/admin/assets/assignments" 
                icon={<UserCheck className="h-4 w-4" />}
                active={location.startsWith('/admin/assets/assignments')}
              >
                {t('navigation.assignments')}
              </NavItem>
            </div>

            {/* INCIDENCIAS */}
            <div className="pl-4 border-l-2 border-gray-200 ml-2 space-y-1 mt-4">
              <div className="font-medium text-sm text-gray-700 mb-2 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Incidencias
              </div>
              <NavItem 
                href="/admin/incidents" 
                icon={<ClipboardList className="h-4 w-4" />}
                active={location === '/admin/incidents'}
              >
                {t('navigation.listing')}
              </NavItem>
              <NavItem 
                href="/admin/incidents/categories" 
                icon={<Tag className="h-4 w-4" />}
                active={location === '/admin/incidents/categories'}
              >
                {t('navigation.categories')}
              </NavItem>
            </div>

            {/* VOLUNTARIOS */}
            <div className="pl-4 border-l-2 border-gray-200 ml-2 space-y-1 mt-4">
              <div className="font-medium text-sm text-gray-700 mb-2 flex items-center">
                <HeartHandshake className="h-4 w-4 mr-2" />
                Voluntarios
              </div>
              <NavItem 
                href="/admin/volunteers" 
                icon={<Users className="h-4 w-4" />}
                active={location === '/admin/volunteers'}
              >
                {t('navigation.listing')}
              </NavItem>
              <NavItem 
                href="/admin/volunteers/register" 
                icon={<Plus className="h-4 w-4" />}
                active={location === '/admin/volunteers/register'}
              >
                Registro
              </NavItem>
              <NavItem 
                href="/admin/volunteers/evaluations" 
                icon={<Star className="h-4 w-4" />}
                active={location === '/admin/volunteers/evaluations'}
              >
                Evaluaciones
              </NavItem>
              <NavItem 
                href="/admin/volunteers/recognition" 
                icon={<Award className="h-4 w-4" />}
                active={location === '/admin/volunteers/recognition'}
              >
                Reconocimientos
              </NavItem>
            </div>
          </ModuleNav>

          {/* 4. ADMIN/FINANZAS */}
          <ModuleNav 
            title="Admin/Finanzas" 
            icon={<DollarSign className="h-5 w-5" />}
            value="admin-finance"
            defaultOpen={location.startsWith('/admin/finance') || location.startsWith('/admin/accounting') || location.startsWith('/admin/concessions')}
          >
            {/* FINANZAS */}
            <div className="pl-4 border-l-2 border-gray-200 ml-2 space-y-1">
              <div className="font-medium text-sm text-gray-700 mb-2 flex items-center">
                <Target className="h-4 w-4 mr-2" />
                Finanzas
              </div>
              <NavItem 
                href="/admin/finance/budget-planning" 
                icon={<Target className="h-4 w-4" />}
                active={location === '/admin/finance/budget-planning'}
              >
                Presupuestos
              </NavItem>
              <NavItem 
                href="/admin/finance/cash-flow-matrix" 
                icon={<LayoutGrid className="h-4 w-4" />}
                active={location === '/admin/finance/cash-flow-matrix'}
              >
                {t('navigation.cashFlow')}
              </NavItem>
              <NavItem 
                href="/admin/finance/calculator" 
                icon={<Calculator className="h-4 w-4" />}
                active={location === '/admin/finance/calculator'}
              >
                Calculadora
              </NavItem>
              <NavItem 
                href="/admin/finance/reports" 
                icon={<FileText className="h-4 w-4" />}
                active={location === '/admin/finance/reports'}
              >
                {t('navigation.reports')}
              </NavItem>
            </div>

            {/* CONTABILIDAD */}
            <div className="pl-4 border-l-2 border-gray-200 ml-2 space-y-1 mt-4">
              <div className="font-medium text-sm text-gray-700 mb-2 flex items-center">
                <BookOpen className="h-4 w-4 mr-2" />
                Contabilidad
              </div>
              <NavItem 
                href="/admin/accounting/dashboard" 
                icon={<BarChart className="h-4 w-4" />}
                active={location === '/admin/accounting/dashboard'}
              >
                Dashboard
              </NavItem>
              <NavItem 
                href="/admin/accounting/categories" 
                icon={<FolderTree className="h-4 w-4" />}
                active={location === '/admin/accounting/categories'}
              >
                Categorías
              </NavItem>
              <NavItem 
                href="/admin/accounting/transactions" 
                icon={<Receipt className="h-4 w-4" />}
                active={location === '/admin/accounting/transactions'}
              >
                Transacciones
              </NavItem>
              <NavItem 
                href="/admin/accounting/journal-entries" 
                icon={<ClipboardList className="h-4 w-4" />}
                active={location === '/admin/accounting/journal-entries'}
              >
                Asientos Contables
              </NavItem>
              <NavItem 
                href="/admin/accounting/trial-balance" 
                icon={<Scale className="h-4 w-4" />}
                active={location === '/admin/accounting/trial-balance'}
              >
                Balance de Comprobación
              </NavItem>
              <NavItem 
                href="/admin/accounting/financial-statements" 
                icon={<FileText className="h-4 w-4" />}
                active={location === '/admin/accounting/financial-statements'}
              >
                Estados Financieros
              </NavItem>
              <NavItem 
                href="/admin/accounting/integration" 
                icon={<ArrowRightLeft className="h-4 w-4" />}
                active={location === '/admin/accounting/integration'}
              >
                Integración Financiera
              </NavItem>
            </div>

            {/* CONCESIONES */}
            <div className="pl-4 border-l-2 border-gray-200 ml-2 space-y-1 mt-4">
              <div className="font-medium text-sm text-gray-700 mb-2 flex items-center">
                <Store className="h-4 w-4 mr-2" />
                Concesiones
              </div>
              <NavItem 
                href="/admin/concessions/catalog" 
                icon={<ListChecks className="h-4 w-4" />}
                active={location.startsWith('/admin/concessions/catalog')}
              >
                Catálogo
              </NavItem>
              <NavItem 
                href="/admin/concessions/concessionaires" 
                icon={<Building className="h-4 w-4" />}
                active={location.startsWith('/admin/concessions/concessionaires')}
              >
                Concesionarios
              </NavItem>
              <NavItem 
                href="/admin/concessions/contracts" 
                icon={<FileText className="h-4 w-4" />}
                active={location.startsWith('/admin/concessions/contracts')}
              >
                {t('navigation.contracts')}
              </NavItem>
              <NavItem 
                href="/admin/concessions/active" 
                icon={<Handshake className="h-4 w-4" />}
                active={location.startsWith('/admin/concessions/active')}
              >
                Concesiones Activas
              </NavItem>
              <NavItem 
                href="/admin/concessions/reports" 
                icon={<BarChart className="h-4 w-4" />}
                active={location.startsWith('/admin/concessions/reports')}
              >
                {t('navigation.reports')}
              </NavItem>
            </div>
          </ModuleNav>

          {/* 5. MKT & COMM */}
          <ModuleNav 
            title="Mkt & Comm" 
            icon={<Megaphone className="h-5 w-5" />}
            value="mkt-comm"
            defaultOpen={location.startsWith('/admin/marketing') || location.startsWith('/admin/communications')}
          >
            {/* MARKETING */}
            <div className="pl-4 border-l-2 border-gray-200 ml-2 space-y-1">
              <div className="font-medium text-sm text-gray-700 mb-2 flex items-center">
                <Megaphone className="h-4 w-4 mr-2" />
                Marketing
              </div>
              <NavItem 
                href="/admin/marketing" 
                icon={<BarChart className="h-4 w-4" />}
                active={location === '/admin/marketing'}
              >
                Dashboard
              </NavItem>
              <NavItem 
                href="/admin/marketing/sponsors" 
                icon={<Building className="h-4 w-4" />}
                active={location.startsWith('/admin/marketing/sponsors')}
              >
                Patrocinadores
              </NavItem>
              <NavItem 
                href="/admin/marketing/contracts" 
                icon={<FileText className="h-4 w-4" />}
                active={location.startsWith('/admin/marketing/contracts')}
              >
                Contratos
              </NavItem>
              <NavItem 
                href="/admin/marketing/events" 
                icon={<Calendar className="h-4 w-4" />}
                active={location.startsWith('/admin/marketing/events')}
              >
                Eventos
              </NavItem>
              <NavItem 
                href="/admin/marketing/assets" 
                icon={<Image className="h-4 w-4" />}
                active={location.startsWith('/admin/marketing/assets')}
              >
                Activos
              </NavItem>
              <NavItem 
                href="/admin/marketing/evaluations" 
                icon={<Star className="h-4 w-4" />}
                active={location.startsWith('/admin/marketing/evaluations')}
              >
                Evaluaciones
              </NavItem>
            </div>

            {/* COMUNICACIÓN */}
            <div className="pl-4 border-l-2 border-gray-200 ml-2 space-y-1 mt-4">
              <div className="font-medium text-sm text-gray-700 mb-2 flex items-center">
                <MessageSquare className="h-4 w-4 mr-2" />
                Comunicación
              </div>
              <NavItem 
                href="/admin/communications" 
                icon={<BarChart className="h-4 w-4" />}
                active={location === '/admin/communications'}
              >
                Dashboard
              </NavItem>
              <NavItem 
                href="/admin/communications/templates" 
                icon={<FileText className="h-4 w-4" />}
                active={location === '/admin/communications/templates'}
              >
                Plantillas
              </NavItem>
              <NavItem 
                href="/admin/communications/queue" 
                icon={<ListChecks className="h-4 w-4" />}
                active={location === '/admin/communications/queue'}
              >
                Cola de Emails
              </NavItem>
              <NavItem 
                href="/admin/communications/campaigns" 
                icon={<Megaphone className="h-4 w-4" />}
                active={location === '/admin/communications/campaigns'}
              >
                Campañas
              </NavItem>
              <NavItem 
                href="/admin/communications/bulk" 
                icon={<Mail className="h-4 w-4" />}
                active={location === '/admin/communications/bulk'}
              >
                Envío Masivo
              </NavItem>
              <NavItem 
                href="/admin/communications/analytics" 
                icon={<TrendingUp className="h-4 w-4" />}
                active={location === '/admin/communications/analytics'}
              >
                Análisis
              </NavItem>
            </div>
          </ModuleNav>

          {/* 6. RECURSOS HUMANOS */}
          <ModuleNav 
            title="Recursos Humanos" 
            icon={<Users className="h-5 w-5" />}
            value="hr"
          >
            <NavItem 
              href="/admin/hr/dashboard" 
              icon={<BarChart className="h-5 w-5" />}
              active={location === '/admin/hr/dashboard'}
            >
              Dashboard
            </NavItem>
            <NavItem 
              href="/admin/hr/employees" 
              icon={<Users className="h-5 w-5" />}
              active={location === '/admin/hr/employees'}
            >
              Empleados
            </NavItem>
            <NavItem 
              href="/admin/hr/payroll" 
              icon={<DollarSign className="h-5 w-5" />}
              active={location === '/admin/hr/payroll'}
            >
              Nómina
            </NavItem>
            <NavItem 
              href="/admin/hr/vacations" 
              icon={<Calendar className="h-5 w-5" />}
              active={location === '/admin/hr/vacations'}
            >
              Vacaciones
            </NavItem>
            <NavItem 
              href="/admin/hr/reports" 
              icon={<FileText className="h-5 w-5" />}
              active={location === '/admin/hr/reports'}
            >
              Reportes
            </NavItem>
          </ModuleNav>



          {/* 8. SEGURIDAD */}
          <ModuleNav 
            title="Seguridad" 
            icon={<Shield className="h-5 w-5" />}
            value="security"
          >
            <NavItem 
              href="/admin/security" 
              icon={<Shield className="h-5 w-5" />}
              active={location === '/admin/security'}
            >
              Dashboard
            </NavItem>
            <NavItem 
              href="/admin/security/password" 
              icon={<Lock className="h-5 w-5" />}
              active={location === '/admin/security/password'}
            >
              Cambiar Contraseña
            </NavItem>
            <NavItem 
              href="/admin/security/audit" 
              icon={<ClipboardList className="h-5 w-5" />}
              active={location === '/admin/security/audit'}
            >
              Auditoría
            </NavItem>
            <NavItem 
              href="/admin/security/settings" 
              icon={<Settings className="h-5 w-5" />}
              active={location === '/admin/security/settings'}
            >
              Configuración
            </NavItem>
          </ModuleNav>









        </Accordion>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <UserProfileImage 
              userId={(user as any)?.id || 0} 
              role={(user as any)?.role || 'user'} 
              name={(user as any)?.fullName || (user as any)?.username || 'Usuario'} 
              size="sm" 
            />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900">
                {user?.firstName && user?.lastName 
                  ? `${user.firstName} ${user.lastName}` 
                  : user?.fullName || user?.username || 'Usuario'}
              </span>
              <span className="text-xs text-gray-500">{user?.role || 'usuario'}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <LanguageSelector />
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleLogout}
            className="text-gray-600 hover:text-gray-900"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebarComplete;