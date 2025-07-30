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
  ChevronRight
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
              {hasPermission('operations.parks.view') && (
                <NavItem 
                  href="/admin/parks" 
                  icon={<Map className="h-4 w-4" />}
                  active={location.startsWith('/admin/parks')}
                >
                  Parques
                </NavItem>
              )}
              {hasPermission('trees.view') && (
                <NavItem 
                  href="/admin/trees/inventory" 
                  icon={<TreePine className="h-4 w-4" />}
                  active={location.startsWith('/admin/trees')}
                >
                  Arbolado
                </NavItem>
              )}
              {hasPermission('activities.view') && (
                <NavItem 
                  href="/admin/activities" 
                  icon={<Calendar className="h-4 w-4" />}
                  active={location.startsWith('/admin/activities')}
                >
                  Actividades
                </NavItem>
              )}
            </ModuleNav>
          )}

          {/* 3. O & M - OPERACIONES Y MANTENIMIENTO */}
          {(hasPermission('operations.assets.view') || hasPermission('operations.incidents.view') || hasPermission('operations.volunteers.view')) && (
            <ModuleNav 
              title="O & M" 
              icon={<Wrench className="h-5 w-5" />}
              value="operations"
            >
              {hasPermission('operations.assets.view') && (
                <NavItem 
                  href="/admin/assets" 
                  icon={<Package className="h-4 w-4" />}
                  active={location.startsWith('/admin/assets')}
                >
                  Activos
                </NavItem>
              )}
              {hasPermission('operations.incidents.view') && (
                <NavItem 
                  href="/admin/incidents" 
                  icon={<AlertTriangle className="h-4 w-4" />}
                  active={location.startsWith('/admin/incidents')}
                >
                  Incidencias
                </NavItem>
              )}
              {hasPermission('operations.volunteers.view') && (
                <NavItem 
                  href="/admin/volunteers" 
                  icon={<HeartHandshake className="h-4 w-4" />}
                  active={location.startsWith('/admin/volunteers')}
                >
                  Voluntarios
                </NavItem>
              )}
            </ModuleNav>
          )}

          {/* 4. ADMIN & FINANZAS */}
          {(hasPermission('finance.budget.view') || hasPermission('finance.catalog.view') || hasPermission('finance.income.view') || hasPermission('finance.expense.view')) && (
            <ModuleNav 
              title="Admin & Finanzas" 
              icon={<DollarSign className="h-5 w-5" />}
              value="admin-finance"
            >
              {hasPermission('finance.budget.view') && (
                <NavItem 
                  href="/admin/finance/reports" 
                  icon={<FileText className="h-4 w-4" />}
                  active={location.startsWith('/admin/finance')}
                >
                  Finanzas
                </NavItem>
              )}
              {(hasPermission('finance.catalog.view') || hasPermission('finance.income.view') || hasPermission('finance.expense.view')) && (
                <NavItem 
                  href="/admin/accounting/categories" 
                  icon={<BookOpen className="h-4 w-4" />}
                  active={location.startsWith('/admin/accounting')}
                >
                  Contabilidad
                </NavItem>
              )}
            </ModuleNav>
          )}

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