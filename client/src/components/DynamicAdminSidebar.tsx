import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { usePermissions } from '@/hooks/usePermissions';
import { 
  BarChart3, Calendar, Users, MapPin, DollarSign, Package, 
  Shield, Bell, Settings, TreeDeciduous, Building, MessageSquare,
  GraduationCap, Activity, AlertTriangle, FileText, ChevronDown,
  Leaf, Wrench, Star, Target, Monitor, ImageIcon, Megaphone,
  User, Award, UserPlus, Tag, Plus, ClipboardList
} from 'lucide-react';

interface MenuItem {
  id: string;
  title: string;
  href: string;
  icon: any;
  permission: string;
  children?: MenuItem[];
}

// Definición de todos los elementos del menú con sus permisos
const MENU_STRUCTURE: MenuItem[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    href: '/admin',
    icon: BarChart3,
    permission: 'dashboard.view'
  },
  {
    id: 'operations',
    title: 'Operaciones',
    href: '/admin/operations',
    icon: Package,
    permission: 'operations.view',
    children: [
      {
        id: 'parks',
        title: 'Parques',
        href: '/admin/parks',
        icon: MapPin,
        permission: 'operations.parks.view',
        children: [
          {
            id: 'parks-dashboard',
            title: 'Dashboard',
            href: '/admin/parks/dashboard',
            icon: BarChart3,
            permission: 'operations.parks.view'
          },
          {
            id: 'parks-list',
            title: 'Gestión',
            href: '/admin/parks',
            icon: Building,
            permission: 'operations.parks.view'
          },
          {
            id: 'parks-evaluations',
            title: 'Evaluaciones',
            href: '/admin/parks/evaluations',
            icon: Star,
            permission: 'operations.parks.view'
          }
        ]
      },
      {
        id: 'assets',
        title: 'Activos',
        href: '/admin/assets',
        icon: Package,
        permission: 'operations.assets.view',
        children: [
          {
            id: 'assets-dashboard',
            title: 'Dashboard',
            href: '/admin/assets/dashboard-fixed',
            icon: BarChart3,
            permission: 'operations.assets.view'
          },
          {
            id: 'assets-categories',
            title: 'Categorías',
            href: '/admin/assets/categories',
            icon: Tag,
            permission: 'operations.assets.view'
          },
          {
            id: 'assets-inventory',
            title: 'Inventario',
            href: '/admin/assets/inventory',
            icon: Package,
            permission: 'operations.assets.view'
          },
          {
            id: 'assets-map',
            title: 'Mapa',
            href: '/admin/assets/map',
            icon: MapPin,
            permission: 'operations.assets.view'
          },
          {
            id: 'assets-maintenance',
            title: 'Mantenimiento',
            href: '/admin/assets/maintenance',
            icon: Wrench,
            permission: 'operations.assets.view'
          }
        ]
      },
      {
        id: 'incidents',
        title: 'Incidencias',
        href: '/admin/incidents',
        icon: AlertTriangle,
        permission: 'operations.incidents.view'
      }
    ]
  },
  {
    id: 'finance',
    title: 'Finanzas',
    href: '/admin/finance',
    icon: DollarSign,
    permission: 'finance.view',
    children: [
      {
        id: 'finance-catalog',
        title: 'Catálogo',
        href: '/admin/finance/catalog',
        icon: FileText,
        permission: 'finance.catalog.view'
      },
      {
        id: 'finance-incomes',
        title: 'Ingresos',
        href: '/admin/finance/incomes',
        icon: DollarSign,
        permission: 'finance.incomes.view'
      },
      {
        id: 'finance-expenses',
        title: 'Egresos',
        href: '/admin/finance/expenses',
        icon: DollarSign,
        permission: 'finance.expenses.view'
      }
    ]
  },
  {
    id: 'activities',
    title: 'Actividades',
    href: '/admin/activities',
    icon: Calendar,
    permission: 'activities.view',
    children: [
      {
        id: 'activities-list',
        title: 'Gestión',
        href: '/admin/activities',
        icon: Calendar,
        permission: 'activities.list.view'
      },
      {
        id: 'activities-calendar',
        title: 'Calendario',
        href: '/admin/activities/calendar',
        icon: Calendar,
        permission: 'activities.calendar.view'
      },
      {
        id: 'activities-instructors',
        title: 'Instructores',
        href: '/admin/instructors',
        icon: GraduationCap,
        permission: 'activities.instructors.view'
      }
    ]
  },
  {
    id: 'trees',
    title: 'Arbolado',
    href: '/admin/trees',
    icon: TreeDeciduous,
    permission: 'trees.view',
    children: [
      {
        id: 'trees-dashboard',
        title: 'Dashboard',
        href: '/admin/trees/dashboard',
        icon: BarChart3,
        permission: 'trees.view'
      },
      {
        id: 'trees-inventory',
        title: 'Inventario',
        href: '/admin/trees/inventory',
        icon: TreeDeciduous,
        permission: 'trees.view'
      },
      {
        id: 'trees-species',
        title: 'Especies',
        href: '/admin/trees/species',
        icon: Leaf,
        permission: 'trees.view'
      },
      {
        id: 'trees-maintenance',
        title: 'Mantenimiento',
        href: '/admin/trees/maintenance',
        icon: Wrench,
        permission: 'trees.view'
      }
    ]
  },
  {
    id: 'users',
    title: 'Usuarios',
    href: '/admin/users',
    icon: Users,
    permission: 'users.view'
  },
  {
    id: 'settings',
    title: 'Configuración',
    href: '/admin/settings',
    icon: Settings,
    permission: 'settings.view'
  },
  {
    id: 'permissions',
    title: 'Permisos',
    href: '/admin/permissions',
    icon: Shield,
    permission: 'permissions.view'
  }
];

interface DynamicAdminSidebarProps {
  className?: string;
}

export const DynamicAdminSidebar: React.FC<DynamicAdminSidebarProps> = ({ className }) => {
  const { hasPermission, hasAnyPermission, user, isLoading } = usePermissions();
  const [location] = useLocation();
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['operations']));

  // Filtrar elementos del menú basado en permisos
  const filterMenuItems = (items: MenuItem[]): MenuItem[] => {
    return items.filter(item => {
      // Verificar si el usuario tiene al menos un permiso para este elemento
      if (item.children) {
        // Para elementos con hijos, verificar si tiene acceso a algún hijo
        const filteredChildren = filterMenuItems(item.children);
        if (filteredChildren.length === 0) return false;
        // Actualizar los hijos filtrados
        item.children = filteredChildren;
      }
      
      // Verificar el permiso específico del elemento
      const hasAccess = hasPermission(item.permission);
      console.log(`🔍 Verificando permiso "${item.permission}" para "${item.title}":`, hasAccess);
      return hasAccess;
    });
  };

  const toggleSection = (sectionId: string) => {
    const newOpenSections = new Set(openSections);
    if (newOpenSections.has(sectionId)) {
      newOpenSections.delete(sectionId);
    } else {
      newOpenSections.add(sectionId);
    }
    setOpenSections(newOpenSections);
  };

  const isActive = (href: string) => {
    return location === href || location.startsWith(href + '/');
  };

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const Icon = item.icon;
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openSections.has(item.id);
    const active = isActive(item.href);

    return (
      <div key={item.id} className="w-full">
        {hasChildren ? (
          <button
            onClick={() => toggleSection(item.id)}
            className={cn(
              "flex items-center justify-between w-full px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-gray-100",
              level > 0 && "pl-8",
              active && "bg-[#00a587] text-white hover:bg-[#00a587]"
            )}
          >
            <div className="flex items-center gap-3">
              <Icon className="w-5 h-5" />
              {item.title}
            </div>
            <ChevronDown className={cn(
              "w-4 h-4 transition-transform",
              isOpen && "transform rotate-180"
            )} />
          </button>
        ) : (
          <Link href={item.href}>
            <a className={cn(
              "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors hover:bg-gray-100",
              level > 0 && "pl-8",
              active && "bg-[#00a587] text-white hover:bg-[#00a587]"
            )}>
              <Icon className="w-5 h-5" />
              {item.title}
            </a>
          </Link>
        )}
        
        {hasChildren && isOpen && (
          <div className="bg-gray-50">
            {item.children?.map(child => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className={cn("w-64 bg-white border-r border-gray-200 min-h-screen", className)}>
        <div className="p-4">
          <div className="animate-pulse space-y-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const filteredMenuItems = filterMenuItems(MENU_STRUCTURE);

  return (
    <div className={cn("w-64 bg-white border-r border-gray-200 min-h-screen", className)}>
      {/* Header del sidebar */}
      <div className="p-4 border-b border-gray-200">
        <Link href="/admin">
          <a className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#00a587] rounded-lg flex items-center justify-center">
              <Building className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">ParkSys</h2>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </a>
        </Link>
      </div>

      {/* Información del usuario */}
      {user && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
              <p className="text-xs text-gray-500 capitalize">{user.role}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navegación filtrada por permisos */}
      <nav className="py-4">
        {filteredMenuItems.length > 0 ? (
          filteredMenuItems.map(item => renderMenuItem(item))
        ) : (
          <div className="px-4 py-8 text-center text-gray-500">
            <Shield className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">Sin permisos de acceso</p>
          </div>
        )}
      </nav>
    </div>
  );
};

export default DynamicAdminSidebar;