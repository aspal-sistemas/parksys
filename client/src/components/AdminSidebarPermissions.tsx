import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import UserProfileImage from '@/components/UserProfileImage';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useTranslation } from 'react-i18next';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Home,
  Map,
  Settings,
  UserCheck,
  Shield,
  Bell,
  FolderOpen,
  Users,
  Activity,
  Star,
  MessageSquare,
  TreePine,
  BarChart,
  Archive,
  Leaf,
  Scissors,
  Plus,
  Calendar,
  GraduationCap,
  CalendarDays,
  ClipboardList,
  Package,
  Wrench,
  Tag,
  AlertTriangle,
  HeartHandshake,
  Award,
  DollarSign,
  Target,
  FileText,
  LayoutGrid,
  Calculator,
  BookOpen,
  FolderTree,
  Receipt,
  Scale,
  Building,
  ListChecks,
  Handshake,
  Megaphone,
  Image,
  Monitor,
  MapPin,
  Grid,
  LogOut,
  ChevronRight,
  Lock
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

interface CollapsibleSubmenuProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isExpanded: boolean;
  onToggle: (id: string) => void;
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

const CollapsibleSubmenu: React.FC<CollapsibleSubmenuProps> = ({
  id,
  title,
  icon,
  children,
  isExpanded,
  onToggle
}) => {
  return (
    <div className="ml-4">
      <Button
        variant="ghost"
        className="w-full justify-start text-sm font-normal h-8 mb-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        onClick={() => onToggle(id)}
      >
        <div className="flex items-center w-full">
          {icon}
          <span className="ml-2 flex-1 text-left">{title}</span>
          <ChevronRight 
            className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
          />
        </div>
      </Button>
      {isExpanded && (
        <div className="ml-6 space-y-1">
          {children}
        </div>
      )}
    </div>
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
    const colorSchemes: Record<string, {
      iconColor: string;
      textColor: string;
      hoverBg: string;
    }> = {
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
      'mkt-comm': {
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
        <div className="flex flex-col gap-1 pt-1">
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
              if (child.type === NavItem) {
                return React.cloneElement(child as React.ReactElement<any>, { moduleColor: colors.iconColor });
              }
            }
            return child;
          })}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

const AdminSidebarPermissions: React.FC = () => {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { t } = useTranslation('common');
  const { hasPermission, isLoading } = usePermissions();
  const [expandedSubmenus, setExpandedSubmenus] = useState<string[]>([]);

  const toggleSubmenu = (submenuId: string) => {
    setExpandedSubmenus(prev => 
      prev.includes(submenuId) 
        ? prev.filter(id => id !== submenuId)
        : [...prev, submenuId]
    );
  };
  
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
    if (location.startsWith('/admin/marketing') || location.startsWith('/admin/communications') || location.startsWith('/admin/advertising')) {
      return ['mkt-comm'];
    }
    
    // Otros módulos
    if (location.startsWith('/admin/users') || location.startsWith('/admin/permissions') || location.startsWith('/admin/settings')) return ['system'];
    if (location.startsWith('/admin/hr')) return ['hr'];
    if (location.startsWith('/admin/security')) return ['security'];
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

  if (isLoading) {
    return (
      <div className="fixed inset-y-0 left-0 w-64 flex flex-col bg-white shadow-lg z-50" style={{ height: '100vh' }}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Cargando permisos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-y-0 left-0 w-64 flex flex-col bg-white shadow-lg z-50" style={{ height: '100vh' }}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b bg-white" style={{ minHeight: '80px' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Map className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">ParkSys</h1>
            <p className="text-sm text-gray-600">Sistema de Parques</p>
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
          {/* Dashboard - siempre visible para usuarios autenticados */}
          {hasPermission('dashboard.view') && (
            <NavItem 
              href="/admin" 
              icon={<Home className="h-5 w-5" />}
              active={location === '/admin'}
            >
              {t('navigation.dashboard')}
            </NavItem>
          )}

          {/* 1. CONFIGURACIÓN */}
          {(hasPermission('settings.view') || hasPermission('users.view') || hasPermission('permissions.view')) && (
            <ModuleNav 
              title={t('navigation.settings')} 
              icon={<Settings className="h-5 w-5" />}
              value="system"
            >
              {hasPermission('settings.view') && (
                <NavItem 
                  href="/admin/settings" 
                  icon={<Settings className="h-5 w-5" />}
                  active={location === '/admin/settings'}
                >
                  {t('navigation.settings')}
                </NavItem>
              )}
              {hasPermission('users.view') && (
                <NavItem 
                  href="/admin/users" 
                  icon={<UserCheck className="h-5 w-5" />}
                  active={location === '/admin/users'}
                >
                  {t('navigation.users')}
                </NavItem>
              )}
              {hasPermission('permissions.view') && (
                <NavItem 
                  href="/admin/permissions" 
                  icon={<Shield className="h-5 w-5" />}
                  active={location === '/admin/permissions'}
                >
                  {t('navigation.permissions')}
                </NavItem>
              )}
            </ModuleNav>
          )}

          {/* 2. GESTIÓN - Secciones principales */}
          {(hasPermission('operations.parks.view') || hasPermission('trees.view') || hasPermission('activities.view')) && (
            <ModuleNav 
              title="Gestión" 
              icon={<FolderOpen className="h-5 w-5" />}
              value="gestion"
            >
              {/* VISITANTES */}
              <CollapsibleSubmenu
                id="visitantes"
                title="Visitantes"
                icon={<Users className="h-4 w-4" />}
                isExpanded={expandedSubmenus.includes('visitantes')}
                onToggle={toggleSubmenu}
              >
                <NavItem 
                  href="/admin/visitors/dashboard" 
                  icon={<BarChart className="h-4 w-4" />}
                  active={location === '/admin/visitors/dashboard'}
                >
                  Dashboard
                </NavItem>
                <NavItem 
                  href="/admin/visitors/count" 
                  icon={<Users className="h-4 w-4" />}
                  active={location === '/admin/visitors/count'}
                >
                  Conteo
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
                  Criterios
                </NavItem>
                <NavItem 
                  href="/admin/visitors/feedback" 
                  icon={<MessageSquare className="h-4 w-4" />}
                  active={location === '/admin/visitors/feedback'}
                >
                  Retroalimentación
                </NavItem>
              </CollapsibleSubmenu>

              {/* PARQUES */}
              <CollapsibleSubmenu
                id="parques"
                title="Parques"
                icon={<Map className="h-4 w-4" />}
                isExpanded={expandedSubmenus.includes('parques')}
                onToggle={toggleSubmenu}
              >
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
                  active={location === '/admin/parks' && !location.includes('/dashboard')}
                >
                  {t('navigation.management')}
                </NavItem>
              </CollapsibleSubmenu>

              {/* ARBOLADO */}
              <CollapsibleSubmenu
                id="arbolado"
                title="Arbolado"
                icon={<TreePine className="h-4 w-4" />}
                isExpanded={expandedSubmenus.includes('arbolado')}
                onToggle={toggleSubmenu}
              >
                <NavItem 
                  href="/admin/trees/dashboard" 
                  icon={<BarChart className="h-4 w-4" />}
                  active={location === '/admin/trees/dashboard'}
                >
                  Dashboard
                </NavItem>
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
              </CollapsibleSubmenu>

              {/* ORGANIZADOR */}
              <CollapsibleSubmenu
                id="organizador"
                title="Organizador"
                icon={<BarChart className="h-4 w-4" />}
                isExpanded={expandedSubmenus.includes('organizador')}
                onToggle={toggleSubmenu}
              >
                <NavItem 
                  href="/admin/organizador" 
                  icon={<BarChart className="h-4 w-4" />}
                  active={location === '/admin/organizador'}
                >
                  Dashboard
                </NavItem>
                <NavItem 
                  href="/admin/organizador/catalogo" 
                  icon={<FolderOpen className="h-4 w-4" />}
                  active={location.startsWith('/admin/organizador/catalogo')}
                >
                  Catálogo
                </NavItem>
              </CollapsibleSubmenu>

              {/* ACTIVIDADES */}
              <CollapsibleSubmenu
                id="actividades"
                title="Actividades"
                icon={<Calendar className="h-4 w-4" />}
                isExpanded={expandedSubmenus.includes('actividades')}
                onToggle={toggleSubmenu}
              >
                <NavItem 
                  href="/admin/activities" 
                  icon={<Calendar className="h-4 w-4" />}
                  active={location === '/admin/activities'}
                >
                  {t('navigation.listing')}
                </NavItem>
                <NavItem 
                  href="/admin/activities/categories" 
                  icon={<BarChart className="h-4 w-4" />}
                  active={location === '/admin/activities/categories'}
                >
                  Categorías
                </NavItem>
                <NavItem 
                  href="/admin/activities/calendar" 
                  icon={<CalendarDays className="h-4 w-4" />}
                  active={location === '/admin/activities/calendar'}
                >
                  Calendario
                </NavItem>
              </CollapsibleSubmenu>

              {/* INSTRUCTORES */}
              <CollapsibleSubmenu
                id="instructores"
                title="Instructores"
                icon={<GraduationCap className="h-4 w-4" />}
                isExpanded={expandedSubmenus.includes('instructores')}
                onToggle={toggleSubmenu}
              >
                <NavItem 
                  href="/admin/instructors" 
                  icon={<GraduationCap className="h-4 w-4" />}
                  active={location === '/admin/instructors'}
                >
                  {t('navigation.listing')}
                </NavItem>
                <NavItem 
                  href="/admin/instructors/assignments" 
                  icon={<ClipboardList className="h-4 w-4" />}
                  active={location === '/admin/instructors/assignments'}
                >
                  {t('navigation.assignments')}
                </NavItem>
                <NavItem 
                  href="/admin/instructors/evaluations" 
                  icon={<Star className="h-4 w-4" />}
                  active={location === '/admin/instructors/evaluations'}
                >
                  Evaluaciones
                </NavItem>
              </CollapsibleSubmenu>

              {/* EVENTOS */}
              <CollapsibleSubmenu
                id="eventos"
                title="Eventos"
                icon={<Calendar className="h-4 w-4" />}
                isExpanded={expandedSubmenus.includes('eventos')}
                onToggle={toggleSubmenu}
              >
                <NavItem 
                  href="/admin/events/categories" 
                  icon={<Tag className="h-4 w-4" />}
                  active={location === '/admin/events/categories'}
                >
                  Categorías
                </NavItem>
                <NavItem 
                  href="/admin/events/list" 
                  icon={<ClipboardList className="h-4 w-4" />}
                  active={location === '/admin/events/list'}
                >
                  Listado
                </NavItem>
              </CollapsibleSubmenu>

              {/* EVENTOS AMBU */}
              <CollapsibleSubmenu
                id="eventos-ambu"
                title="Eventos AMBU"
                icon={<Calendar className="h-4 w-4" />}
                isExpanded={expandedSubmenus.includes('eventos-ambu')}
                onToggle={toggleSubmenu}
              >
                <NavItem 
                  href="/admin/eventos-ambu/calendar" 
                  icon={<Calendar className="h-4 w-4" />}
                  active={location === '/admin/eventos-ambu/calendar'}
                >
                  Calendario
                </NavItem>
              </CollapsibleSubmenu>

              {/* RESERVAS DE ESPACIOS */}
              <CollapsibleSubmenu
                id="reservas"
                title="Reservas de Espacios"
                icon={<MapPin className="h-4 w-4" />}
                isExpanded={expandedSubmenus.includes('reservas')}
                onToggle={toggleSubmenu}
              >
                <NavItem 
                  href="/admin/space-reservations/spaces" 
                  icon={<MapPin className="h-4 w-4" />}
                  active={location.startsWith('/admin/space-reservations/spaces')}
                >
                  Espacios
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
                  Cal. Reservas
                </NavItem>
              </CollapsibleSubmenu>

              {/* AMENIDADES */}
              <CollapsibleSubmenu
                id="amenidades"
                title="Amenidades"
                icon={<Package className="h-4 w-4" />}
                isExpanded={expandedSubmenus.includes('amenidades')}
                onToggle={toggleSubmenu}
              >
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
              </CollapsibleSubmenu>
            </ModuleNav>
          )}

          {/* 3. O & M - OPERACIONES Y MANTENIMIENTO */}
          {(hasPermission('operations.assets.view') || hasPermission('operations.incidents.view') || hasPermission('operations.volunteers.view')) && (
            <ModuleNav 
              title="O & M" 
              icon={<Wrench className="h-5 w-5" />}
              value="operations"
            >
              {/* ACTIVOS */}
              <CollapsibleSubmenu
                id="activos"
                title="Activos"
                icon={<Package className="h-4 w-4" />}
                isExpanded={expandedSubmenus.includes('activos')}
                onToggle={toggleSubmenu}
              >
                <NavItem 
                  href="/admin/assets" 
                  icon={<BarChart className="h-4 w-4" />}
                  active={location === '/admin/assets'}
                >
                  Dashboard
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
                  icon={<MapPin className="h-4 w-4" />}
                  active={location.startsWith('/admin/assets/map')}
                >
                  {t('navigation.map')}
                </NavItem>
                <NavItem 
                  href="/admin/assets/maintenance" 
                  icon={<Wrench className="h-4 w-4" />}
                  active={location.startsWith('/admin/assets/maintenance')}
                >
                  Mantenimiento
                </NavItem>
              </CollapsibleSubmenu>

              {/* INCIDENCIAS */}
              <CollapsibleSubmenu
                id="incidencias"
                title="Incidencias"
                icon={<AlertTriangle className="h-4 w-4" />}
                isExpanded={expandedSubmenus.includes('incidencias')}
                onToggle={toggleSubmenu}
              >
                <NavItem 
                  href="/admin/incidents" 
                  icon={<AlertTriangle className="h-4 w-4" />}
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
              </CollapsibleSubmenu>

              {/* VOLUNTARIOS */}
              <CollapsibleSubmenu
                id="voluntarios-ops"
                title="Voluntarios"
                icon={<HeartHandshake className="h-4 w-4" />}
                isExpanded={expandedSubmenus.includes('voluntarios-ops')}
                onToggle={toggleSubmenu}
              >
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
              </CollapsibleSubmenu>
            </ModuleNav>
          )}

          {/* 4. ADMIN & FINANZAS */}
          {(hasPermission('finance.budget.view') || hasPermission('finance.catalog.view') || hasPermission('finance.income.view') || hasPermission('finance.expense.view')) && (
            <ModuleNav 
              title="Admin & Finanzas" 
              icon={<DollarSign className="h-5 w-5" />}
              value="admin-finance"
            >
              {/* FINANZAS */}
              <CollapsibleSubmenu
                id="finanzas"
                title="Finanzas"
                icon={<Target className="h-4 w-4" />}
                isExpanded={expandedSubmenus.includes('finanzas')}
                onToggle={toggleSubmenu}
              >
                <NavItem 
                  href="/admin/finance/reports" 
                  icon={<FileText className="h-4 w-4" />}
                  active={location === '/admin/finance/reports'}
                >
                  Dashboard
                </NavItem>
                <NavItem 
                  href="/admin/finance/budget-planning" 
                  icon={<Target className="h-4 w-4" />}
                  active={location === '/admin/finance/budget-planning'}
                >
                  Presupuestos
                </NavItem>
                <NavItem 
                  href="/admin/finance/catalog" 
                  icon={<FolderOpen className="h-4 w-4" />}
                  active={location === '/admin/finance/catalog'}
                >
                  Catálogo
                </NavItem>
                <NavItem 
                  href="/admin/finance/income" 
                  icon={<LayoutGrid className="h-4 w-4" />}
                  active={location === '/admin/finance/income'}
                >
                  Ingresos
                </NavItem>
                <NavItem 
                  href="/admin/finance/expense" 
                  icon={<Calculator className="h-4 w-4" />}
                  active={location === '/admin/finance/expense'}
                >
                  Gastos
                </NavItem>
              </CollapsibleSubmenu>

              {/* CONTABILIDAD */}
              <CollapsibleSubmenu
                id="contabilidad"
                title="Contabilidad"
                icon={<BookOpen className="h-4 w-4" />}
                isExpanded={expandedSubmenus.includes('contabilidad')}
                onToggle={toggleSubmenu}
              >
                <NavItem 
                  href="/admin/accounting/categories" 
                  icon={<FolderTree className="h-4 w-4" />}
                  active={location === '/admin/accounting/categories'}
                >
                  {t('navigation.categories')}
                </NavItem>
                <NavItem 
                  href="/admin/accounting/transactions" 
                  icon={<Receipt className="h-4 w-4" />}
                  active={location === '/admin/accounting/transactions'}
                >
                  Transacciones
                </NavItem>
                <NavItem 
                  href="/admin/accounting/balance" 
                  icon={<Scale className="h-4 w-4" />}
                  active={location === '/admin/accounting/balance'}
                >
                  Balance
                </NavItem>
                <NavItem 
                  href="/admin/accounting/reports" 
                  icon={<FileText className="h-4 w-4" />}
                  active={location === '/admin/accounting/reports'}
                >
                  {t('navigation.reports')}
                </NavItem>
                <NavItem 
                  href="/admin/accounting/cashflow" 
                  icon={<Target className="h-4 w-4" />}
                  active={location === '/admin/accounting/cashflow'}
                >
                  {t('navigation.cashFlow')}
                </NavItem>
              </CollapsibleSubmenu>

              {/* CONCESIONES */}
              <CollapsibleSubmenu
                id="concesiones"
                title="Concesiones"
                icon={<Building className="h-4 w-4" />}
                isExpanded={expandedSubmenus.includes('concesiones')}
                onToggle={toggleSubmenu}
              >
                <NavItem 
                  href="/admin/concessions" 
                  icon={<BarChart className="h-4 w-4" />}
                  active={location === '/admin/concessions'}
                >
                  Dashboard
                </NavItem>
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
                  C. Activas
                </NavItem>
              </CollapsibleSubmenu>
            </ModuleNav>
          )}

          {/* 5. MKT & COMM */}
          <ModuleNav 
            title="Mkt & Comm" 
            icon={<Megaphone className="h-5 w-5" />}
            value="mkt-comm"
          >
            {/* MARKETING */}
            <CollapsibleSubmenu
              id="marketing"
              title="Marketing"
              icon={<Megaphone className="h-4 w-4" />}
              isExpanded={expandedSubmenus.includes('marketing')}
              onToggle={toggleSubmenu}
            >
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
            </CollapsibleSubmenu>

            {/* PUBLICIDAD DIGITAL */}
            <CollapsibleSubmenu
              id="advertising"
              title="Publicidad Digital"
              icon={<Monitor className="h-4 w-4" />}
              isExpanded={expandedSubmenus.includes('advertising')}
              onToggle={toggleSubmenu}
            >
              <NavItem 
                href="/admin/advertising" 
                icon={<BarChart className="h-4 w-4" />}
                active={location === '/admin/advertising'}
              >
                Dashboard
              </NavItem>
              <NavItem 
                href="/admin/advertising/spaces" 
                icon={<LayoutGrid className="h-4 w-4" />}
                active={location.startsWith('/admin/advertising/spaces')}
              >
                Espacios Publicitarios
              </NavItem>
              <NavItem 
                href="/admin/advertising/advertisements" 
                icon={<Image className="h-4 w-4" />}
                active={location.startsWith('/admin/advertising/advertisements')}
              >
                Anuncios
              </NavItem>
              <NavItem 
                href="/admin/advertising/campaigns" 
                icon={<Target className="h-4 w-4" />}
                active={location.startsWith('/admin/advertising/campaigns')}
              >
                Campañas
              </NavItem>
              <NavItem 
                href="/admin/advertising/assignments" 
                icon={<MapPin className="h-4 w-4" />}
                active={location.startsWith('/admin/advertising/assignments')}
              >
                Asignaciones
              </NavItem>
              <NavItem 
                href="/admin/advertising/space-mappings" 
                icon={<Grid className="h-4 w-4" />}
                active={location.startsWith('/admin/advertising/space-mappings')}
              >
                Mapeo de Espacios
              </NavItem>
            </CollapsibleSubmenu>

            {/* COMUNICACIÓN */}
            <CollapsibleSubmenu
              id="comunicacion"
              title="Comunicación"
              icon={<MessageSquare className="h-4 w-4" />}
              isExpanded={expandedSubmenus.includes('comunicacion')}
              onToggle={toggleSubmenu}
            >
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
                icon={<ClipboardList className="h-4 w-4" />}
                active={location === '/admin/communications/queue'}
              >
                Cola de Emails
              </NavItem>
              <NavItem 
                href="/admin/communications/campaigns" 
                icon={<Megaphone className="h-4 w-4" />}
                active={location === '/admin/communications/campaigns'}
              >
                Campañas de Email
              </NavItem>
              <NavItem 
                href="/admin/communications/bulk" 
                icon={<Users className="h-4 w-4" />}
                active={location === '/admin/communications/bulk'}
              >
                Envío Masivo
              </NavItem>
              <NavItem 
                href="/admin/communications/analytics" 
                icon={<BarChart className="h-4 w-4" />}
                active={location === '/admin/communications/analytics'}
              >
                Análisis
              </NavItem>
            </CollapsibleSubmenu>
          </ModuleNav>

          {/* 6. HR - RECURSOS HUMANOS */}
          <ModuleNav 
            title="HR" 
            icon={<Users className="h-5 w-5" />}
            value="hr"
          >
            <NavItem 
              href="/admin/hr/employees" 
              icon={<Users className="h-4 w-4" />}
              active={location.startsWith('/admin/hr/employees')}
            >
              Empleados
            </NavItem>
            <NavItem 
              href="/admin/hr/departments" 
              icon={<Building className="h-4 w-4" />}
              active={location.startsWith('/admin/hr/departments')}
            >
              Departamentos
            </NavItem>
            <NavItem 
              href="/admin/hr/evaluations" 
              icon={<Star className="h-4 w-4" />}
              active={location.startsWith('/admin/hr/evaluations')}
            >
              Evaluaciones
            </NavItem>
            <NavItem 
              href="/admin/hr/vacation" 
              icon={<Calendar className="h-4 w-4" />}
              active={location.startsWith('/admin/hr/vacation')}
            >
              Vacaciones
            </NavItem>
          </ModuleNav>

          {/* 7. SEGURIDAD */}
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
                {(user as any)?.firstName && (user as any)?.lastName 
                  ? `${(user as any).firstName} ${(user as any).lastName}` 
                  : (user as any)?.fullName || (user as any)?.username || 'Usuario'}
              </span>
              <span className="text-xs text-gray-500">{(user as any)?.role || 'usuario'}</span>
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

export default AdminSidebarPermissions;