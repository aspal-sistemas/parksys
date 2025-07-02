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
  Mail,
  Clock,
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
  Book,
  Plus
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

const AdminSidebarComplete: React.FC = () => {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { t } = useTranslation('common');
  
  // Determinar qué módulo debe estar abierto basado en la ruta actual
  const getActiveModule = () => {
    if (location.startsWith('/admin/parks')) return ['parks'];
    if (location.startsWith('/admin/users') || location.startsWith('/admin/permissions')) return ['users'];
    if (location.startsWith('/admin/amenities')) return ['amenities'];
    if (location.startsWith('/admin/incidents')) return ['incidents'];
    if (location.startsWith('/admin/assets')) return ['assets'];
    if (location.startsWith('/admin/finance')) return ['finance'];
    if (location.startsWith('/admin/events')) return ['events'];
    if (location.startsWith('/admin/activities') || location.startsWith('/admin/organizador') || location.startsWith('/admin/instructors')) return ['activities'];
    if (location.startsWith('/admin/marketing')) return ['marketing'];
    if (location.startsWith('/admin/concessions')) return ['concessions'];
    if (location.startsWith('/admin/hr')) return ['hr'];
    if (location.startsWith('/admin/volunteers')) return ['volunteers'];
    if (location.startsWith('/admin/trees')) return ['trees'];
    if (location.startsWith('/admin/communications')) return ['communications'];
    if (location.startsWith('/admin/security')) return ['security'];
    if (location.startsWith('/admin/settings') || location.startsWith('/admin/analytics') || location.startsWith('/admin/documents') || location.startsWith('/admin/comments')) return ['system'];
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

          {/* 2. PARQUES */}
          <ModuleNav 
            title={t('navigation.parks')} 
            icon={<Map className="h-5 w-5" />}
            value="parks"
          >
            <NavItem 
              href="/admin/parks/dashboard" 
              icon={<BarChart className="h-5 w-5" />}
              active={location === '/admin/parks/dashboard'}
            >
              {t('navigation.operativeSummary')}
            </NavItem>
            <NavItem 
              href="/admin/parks" 
              icon={<Map className="h-5 w-5" />}
              active={location === '/admin/parks'}
            >
              {t('navigation.management')}
            </NavItem>
          </ModuleNav>

          {/* 3. ÁRBOLES */}
          <ModuleNav 
            title={t('navigation.trees')} 
            icon={<TreePine className="h-5 w-5" />}
            value="trees"
          >
            <NavItem 
              href="/admin/trees/inventory" 
              icon={<Archive className="h-5 w-5" />}
              active={location.startsWith('/admin/trees/inventory')}
            >
              {t('navigation.inventory')}
            </NavItem>
            <NavItem 
              href="/admin/trees/species" 
              icon={<Leaf className="h-5 w-5" />}
              active={location.startsWith('/admin/trees/species')}
            >
              {t('navigation.species')}
            </NavItem>
            <NavItem 
              href="/admin/trees/maintenance" 
              icon={<Scissors className="h-5 w-5" />}
              active={location.startsWith('/admin/trees/maintenance')}
            >
              {t('navigation.maintenance')}
            </NavItem>
            <NavItem 
              href="/admin/trees/planting" 
              icon={<TreePine className="h-5 w-5" />}
              active={location.startsWith('/admin/trees/planting')}
            >
              {t('navigation.planting')}
            </NavItem>
          </ModuleNav>

          {/* 4. AMENIDADES */}
          <ModuleNav 
            title={t('navigation.amenities')} 
            icon={<Package className="h-5 w-5" />}
            value="amenities"
          >
            <NavItem 
              href="/admin/amenities-dashboard" 
              icon={<BarChart className="h-5 w-5" />}
              active={location === '/admin/amenities-dashboard'}
            >
              {t('navigation.operativeSummary')}
            </NavItem>
            <NavItem 
              href="/admin/amenities" 
              icon={<Package className="h-5 w-5" />}
              active={location === '/admin/amenities'}
            >
              {t('navigation.management')}
            </NavItem>
          </ModuleNav>

          {/* 5. ACTIVIDADES */}
          <ModuleNav 
            title={t('navigation.activities')} 
            icon={<Calendar className="h-5 w-5" />}
            value="activities"
          >
            <NavItem 
              href="/admin/organizador" 
              icon={<BarChart3 className="h-5 w-5" />}
              active={location.startsWith('/admin/organizador')}
            >
              Dashboard
            </NavItem>
            <NavItem 
              href="/admin/activities/categories" 
              icon={<Tag className="h-5 w-5" />}
              active={location.startsWith('/admin/activities/categories')}
            >
              Categorías
            </NavItem>
            <NavItem 
              href="/admin/activities" 
              icon={<Activity className="h-5 w-5" />}
              active={location === '/admin/activities'}
            >
              {t('navigation.listing')}
            </NavItem>
            <NavItem 
              href="/admin/organizador/catalogo/crear" 
              icon={<Plus className="h-5 w-5" />}
              active={location.startsWith('/admin/organizador/catalogo/crear')}
            >
              Nueva Actividad
            </NavItem>
            <NavItem 
              href="/admin/activities/calendar" 
              icon={<Calendar className="h-5 w-5" />}
              active={location.startsWith('/admin/activities/calendar')}
            >
              Calendario
            </NavItem>
            <NavItem 
              href="/admin/instructors" 
              icon={<GraduationCap className="h-5 w-5" />}
              active={location === '/admin/instructors'}
            >
              {t('navigation.instructors')}
            </NavItem>
          </ModuleNav>

          {/* 6. ACTIVOS */}
          <ModuleNav 
            title={t('navigation.assets')} 
            icon={<Package className="h-5 w-5" />}
            value="assets"
          >
            <NavItem 
              href="/admin/assets" 
              icon={<BarChart className="h-5 w-5" />}
              active={location === '/admin/assets'}
            >
              {t('navigation.operativeSummary')}
            </NavItem>
            <NavItem 
              href="/admin/assets/inventory" 
              icon={<Archive className="h-5 w-5" />}
              active={location.startsWith('/admin/assets/inventory')}
            >
              {t('navigation.inventory')}
            </NavItem>
            <NavItem 
              href="/admin/assets/map" 
              icon={<Map className="h-5 w-5" />}
              active={location === '/admin/assets/map'}
            >
              {t('navigation.map')}
            </NavItem>
            <NavItem 
              href="/admin/assets/maintenance" 
              icon={<Wrench className="h-5 w-5" />}
              active={location.startsWith('/admin/assets/maintenance')}
            >
              {t('navigation.maintenance')}
            </NavItem>
            <NavItem 
              href="/admin/assets/assignments" 
              icon={<UserCheck className="h-5 w-5" />}
              active={location.startsWith('/admin/assets/assignments')}
            >
              {t('navigation.assignments')}
            </NavItem>
          </ModuleNav>

          {/* 7. INCIDENCIAS */}
          <ModuleNav 
            title={t('navigation.incidents')} 
            icon={<AlertTriangle className="h-5 w-5" />}
            value="incidents"
          >
            <NavItem 
              href="/admin/incidents" 
              icon={<ClipboardList className="h-5 w-5" />}
              active={location === '/admin/incidents'}
            >
              {t('navigation.listing')}
            </NavItem>
            <NavItem 
              href="/admin/incidents/categories" 
              icon={<Tag className="h-5 w-5" />}
              active={location === '/admin/incidents/categories'}
            >
              {t('navigation.categories')}
            </NavItem>
          </ModuleNav>

          {/* 8. FINANZAS */}
          <ModuleNav 
            title={t('navigation.finance')} 
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
              href="/admin/finance/budget-planning" 
              icon={<Target className="h-5 w-5" />}
              active={location === '/admin/finance/budget-planning'}
            >
              Planificación Presupuestaria
            </NavItem>
            <NavItem 
              href="/admin/finance/cash-flow-matrix" 
              icon={<LayoutGrid className="h-5 w-5" />}
              active={location === '/admin/finance/cash-flow-matrix'}
            >
              {t('navigation.cashFlow')}
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
              {t('navigation.reports')}
            </NavItem>
            <NavItem 
              href="/admin/finance/dashboard" 
              icon={<BarChart className="h-5 w-5" />}
              active={location === '/admin/finance/dashboard'}
            >
              {t('navigation.dashboard')}
            </NavItem>
          </ModuleNav>

          {/* 9. EVENTOS */}
          <ModuleNav 
            title="Eventos" 
            icon={<CalendarDays className="h-5 w-5" />}
            value="events"
            defaultOpen={location.startsWith('/admin/events') || location.startsWith('/admin/eventos-ambu')}
          >
            <NavItem 
              href="/admin/events/new" 
              icon={<Plus className="h-5 w-5" />}
              active={location.startsWith('/admin/events/new')}
            >
              Nuevo Evento
            </NavItem>
            <NavItem 
              href="/admin/events/categories" 
              icon={<Tag className="h-5 w-5" />}
              active={location.startsWith('/admin/events/categories')}
            >
              Categorías
            </NavItem>
            <NavItem 
              href="/admin/eventos-ambu" 
              icon={<ListFilter className="h-5 w-5" />}
              active={location.startsWith('/admin/eventos-ambu') && !location.includes('/calendar') && !location.includes('/tabulador')}
            >
              Eventos
            </NavItem>
            <NavItem 
              href="/admin/eventos-ambu/calendar" 
              icon={<Calendar className="h-5 w-5" />}
              active={location.startsWith('/admin/eventos-ambu/calendar')}
            >
              Calendario
            </NavItem>
            <NavItem 
              href="/admin/eventos-ambu/tabulador" 
              icon={<DollarSign className="h-5 w-5" />}
              active={location.startsWith('/admin/eventos-ambu/tabulador')}
            >
              Tabulador de Costos
            </NavItem>
          </ModuleNav>

          {/* 10. MARKETING */}
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

          {/* 11. CONCESIONES */}
          <ModuleNav 
            title={t('navigation.concessions')} 
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
              href="/admin/concessions/concessionaires" 
              icon={<Building className="h-5 w-5" />}
              active={location.startsWith('/admin/concessions/concessionaires')}
            >
              Concesionarios
            </NavItem>
            <NavItem 
              href="/admin/concessions/contracts" 
              icon={<FileText className="h-5 w-5" />}
              active={location.startsWith('/admin/concessions/contracts')}
            >
              {t('navigation.contracts')}
            </NavItem>
            <NavItem 
              href="/admin/concessions/active" 
              icon={<Handshake className="h-5 w-5" />}
              active={location.startsWith('/admin/concessions/active')}
            >
              Concesiones Activas
            </NavItem>
            <NavItem 
              href="/admin/concessions/reports" 
              icon={<BarChart className="h-5 w-5" />}
              active={location.startsWith('/admin/concessions/reports')}
            >
              {t('navigation.reports')}
            </NavItem>
          </ModuleNav>

          {/* 12. RECURSOS HUMANOS */}
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
              href="/admin/hr/payroll" 
              icon={<CreditCard className="h-5 w-5" />}
              active={location.startsWith('/admin/hr/payroll')}
            >
              Nómina
            </NavItem>
            <NavItem 
              href="/admin/hr/receipts" 
              icon={<FileText className="h-5 w-5" />}
              active={location.startsWith('/admin/hr/receipts')}
            >
              Recibos
            </NavItem>
            <NavItem 
              href="/admin/hr/vacation" 
              icon={<Clock className="h-5 w-5" />}
              active={location.startsWith('/admin/hr/vacation')}
            >
              Vacaciones
            </NavItem>
          </ModuleNav>

          {/* VOLUNTARIOS */}
          <ModuleNav 
            title={t('navigation.volunteers')} 
            icon={<HeartHandshake className="h-5 w-5" />}
            value="volunteers"
          >
            <NavItem 
              href="/admin/volunteers" 
              icon={<PersonStanding className="h-5 w-5" />}
              active={location === '/admin/volunteers'}
            >
              {t('navigation.listing')}
            </NavItem>
            <NavItem 
              href="/admin/volunteers/register" 
              icon={<ClipboardCheck className="h-5 w-5" />}
              active={location.startsWith('/admin/volunteers/register')}
            >
              Registro
            </NavItem>
            <NavItem 
              href="/admin/volunteers/evaluations" 
              icon={<Star className="h-5 w-5" />}
              active={location.startsWith('/admin/volunteers/evaluations')}
            >
              Evaluaciones
            </NavItem>
            <NavItem 
              href="/admin/volunteers/recognition" 
              icon={<Award className="h-5 w-5" />}
              active={location.startsWith('/admin/volunteers/recognition')}
            >
              Reconocimientos
            </NavItem>
          </ModuleNav>

          {/* 13. COMUNICACIÓN */}
          <ModuleNav 
            title="Comunicación" 
            icon={<MessageSquare className="h-5 w-5" />}
            value="communications"
          >
            <NavItem 
              href="/admin/communications" 
              icon={<BarChart className="h-5 w-5" />}
              active={location === '/admin/communications'}
            >
              Dashboard
            </NavItem>
            <NavItem 
              href="/admin/communications/templates" 
              icon={<FileText className="h-5 w-5" />}
              active={location.startsWith('/admin/communications/templates')}
            >
              Plantillas
            </NavItem>
            <NavItem 
              href="/admin/communications/queue" 
              icon={<Clock className="h-5 w-5" />}
              active={location.startsWith('/admin/communications/queue')}
            >
              Cola de Emails
            </NavItem>
            <NavItem 
              href="/admin/communications/campaigns" 
              icon={<Users className="h-5 w-5" />}
              active={location.startsWith('/admin/communications/campaigns')}
            >
              Campañas
            </NavItem>
            <NavItem 
              href="/admin/communications/bulk" 
              icon={<Mail className="h-5 w-5" />}
              active={location.startsWith('/admin/communications/bulk')}
            >
              Envío Masivo
            </NavItem>
            <NavItem 
              href="/admin/communications/analytics" 
              icon={<TrendingUp className="h-5 w-5" />}
              active={location.startsWith('/admin/communications/analytics')}
            >
              Análisis
            </NavItem>
          </ModuleNav>

          {/* 14. SEGURIDAD */}
          <ModuleNav 
            title="Seguridad" 
            icon={<Shield className="h-5 w-5" />}
            value="security"
          >
            <NavItem 
              href="/admin/security" 
              icon={<Activity className="h-5 w-5" />}
              active={location === '/admin/security'}
            >
              Centro de Seguridad
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