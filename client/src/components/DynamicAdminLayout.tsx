import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  Users, Settings, Shield, UserCog, BarChart3, TreePine, 
  Building2, Calendar, CreditCard, MessageSquare, Activity,
  ChevronDown, ChevronRight, Home, Eye, Palette
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RoleBadgeWithText } from '@/components/RoleBadge';

// Definición de módulos del sistema con estructura jerárquica
const SYSTEM_MODULES = {
  'Configuración': {
    icon: Settings,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    permissions: ['read', 'write', 'admin'],
    submodules: [
      { name: 'Usuarios', path: '/admin-roles/users', icon: Users },
      { name: 'Configuración General', path: '/admin-roles/config', icon: Settings }
    ]
  },
  'Gestión': {
    icon: UserCog,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    permissions: ['read', 'write', 'admin'],
    submodules: [
      { name: 'Parques', path: '/admin-roles/parks', icon: TreePine },
      { name: 'Actividades', path: '/admin-roles/activities', icon: Activity },
      { name: 'Voluntarios', path: '/admin-roles/volunteers', icon: Users }
    ]
  },
  'Operaciones': {
    icon: Building2,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    permissions: ['read', 'write', 'admin'],
    submodules: [
      { name: 'Eventos', path: '/admin-roles/events', icon: Calendar },
      { name: 'Concesiones', path: '/admin-roles/concessions', icon: Building2 }
    ]
  },
  'Finanzas': {
    icon: CreditCard,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    permissions: ['read', 'write', 'admin'],
    submodules: [
      { name: 'Presupuestos', path: '/admin-roles/budgets', icon: BarChart3 },
      { name: 'Patrocinios', path: '/admin-roles/sponsors', icon: CreditCard }
    ]
  },
  'Marketing': {
    icon: MessageSquare,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    permissions: ['read', 'write', 'admin'],
    submodules: [
      { name: 'Comunicaciones', path: '/admin-roles/communications', icon: MessageSquare },
      { name: 'Publicidad', path: '/admin-roles/advertising', icon: Palette }
    ]
  },
  'Recursos Humanos': {
    icon: Users,
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    permissions: ['read', 'write', 'admin'],
    submodules: [
      { name: 'Empleados', path: '/admin-roles/employees', icon: Users },
      { name: 'Nómina', path: '/admin-roles/payroll', icon: CreditCard }
    ]
  },
  'Seguridad': {
    icon: Shield,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    permissions: ['read', 'write', 'admin'],
    submodules: [
      { name: 'Roles', path: '/admin-roles/roles', icon: Shield },
      { name: 'Matriz de Permisos', path: '/admin-roles/permissions/matrix', icon: UserCog },
      { name: 'Usuarios del Sistema', path: '/admin-roles/users', icon: Users }
    ]
  }
};

// Roles del sistema con niveles de permisos
const SYSTEM_ROLES = [
  { id: 'super-admin', title: 'Super Admin', level: 1, permissions: ['admin'] },
  { id: 'director-general', title: 'Director General', level: 2, permissions: ['admin', 'write', 'read'] },
  { id: 'coordinador-parques', title: 'Coordinador de Parques', level: 3, permissions: ['write', 'read'] },
  { id: 'supervisor-operaciones', title: 'Supervisor de Operaciones', level: 4, permissions: ['write', 'read'] },
  { id: 'especialista-tecnico', title: 'Especialista Técnico', level: 5, permissions: ['write', 'read'] },
  { id: 'asistente-administrativo', title: 'Asistente Administrativo', level: 6, permissions: ['read'] },
  { id: 'consultor-auditor', title: 'Consultor Auditor', level: 7, permissions: ['read'] }
];

// Permisos por defecto para cada rol y módulo
const DEFAULT_ROLE_PERMISSIONS = {
  'super-admin': {
    'Configuración': 'admin', 'Gestión': 'admin', 'Operaciones': 'admin',
    'Finanzas': 'admin', 'Marketing': 'admin', 'Recursos Humanos': 'admin', 'Seguridad': 'admin'
  },
  'director-general': {
    'Configuración': 'admin', 'Gestión': 'admin', 'Operaciones': 'admin',
    'Finanzas': 'admin', 'Marketing': 'write', 'Recursos Humanos': 'admin', 'Seguridad': 'write'
  },
  'coordinador-parques': {
    'Configuración': 'read', 'Gestión': 'admin', 'Operaciones': 'write',
    'Finanzas': 'read', 'Marketing': 'read', 'Recursos Humanos': 'read', 'Seguridad': 'none'
  },
  'supervisor-operaciones': {
    'Configuración': 'read', 'Gestión': 'write', 'Operaciones': 'admin',
    'Finanzas': 'read', 'Marketing': 'read', 'Recursos Humanos': 'read', 'Seguridad': 'none'
  },
  'especialista-tecnico': {
    'Configuración': 'none', 'Gestión': 'write', 'Operaciones': 'write',
    'Finanzas': 'none', 'Marketing': 'none', 'Recursos Humanos': 'none', 'Seguridad': 'none'
  },
  'asistente-administrativo': {
    'Configuración': 'none', 'Gestión': 'read', 'Operaciones': 'read',
    'Finanzas': 'read', 'Marketing': 'read', 'Recursos Humanos': 'read', 'Seguridad': 'none'
  },
  'consultor-auditor': {
    'Configuración': 'read', 'Gestión': 'read', 'Operaciones': 'read',
    'Finanzas': 'read', 'Marketing': 'read', 'Recursos Humanos': 'read', 'Seguridad': 'read'
  }
};

interface DynamicAdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function DynamicAdminLayout({ children, title, subtitle }: DynamicAdminLayoutProps) {
  const [location] = useLocation();
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [currentRole, setCurrentRole] = useState<string>('super-admin');
  const [previewMode, setPreviewMode] = useState(false);

  // Obtener permisos del rol actual
  const getRolePermissions = (roleId: string) => {
    return DEFAULT_ROLE_PERMISSIONS[roleId] || {};
  };

  // Verificar si un módulo es accesible por el rol
  const canAccessModule = (moduleKey: string, roleId: string) => {
    const permissions = getRolePermissions(roleId);
    return permissions[moduleKey] && permissions[moduleKey] !== 'none';
  };

  // Toggle de expansión de módulos
  const toggleModule = (moduleKey: string) => {
    setExpandedModules(prev => 
      prev.includes(moduleKey) 
        ? prev.filter(key => key !== moduleKey)
        : [...prev, moduleKey]
    );
  };

  // Obtener el título de la página actual
  const getCurrentTitle = () => {
    if (title) return title;
    
    for (const [moduleKey, module] of Object.entries(SYSTEM_MODULES)) {
      if (location === `/admin-roles/dashboard/${moduleKey.toLowerCase().replace(' ', '-')}`) {
        return `Dashboard - ${moduleKey}`;
      }
      for (const submodule of module.submodules) {
        if (location === submodule.path) {
          return submodule.name;
        }
      }
    }
    return 'Sistema de Roles';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{getCurrentTitle()}</h1>
            {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
          </div>
          
          {/* Selector de rol para pruebas */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Vista previa:</span>
            </div>
            <Select value={currentRole} onValueChange={setCurrentRole}>
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SYSTEM_ROLES.map(role => (
                  <SelectItem key={role.id} value={role.id}>
                    <div className="flex items-center gap-2">
                      <RoleBadgeWithText roleId={role.id} size="sm" />
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar dinámico */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-6">
              <Shield className="h-6 w-6 text-blue-600" />
              <span className="font-semibold">ParkSys Admin</span>
            </div>

            {/* Información del rol actual */}
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Rol Actual</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <RoleBadgeWithText roleId={currentRole} />
                <div className="text-xs text-gray-500 mt-1">
                  Nivel {SYSTEM_ROLES.find(r => r.id === currentRole)?.level}
                </div>
              </CardContent>
            </Card>

            {/* Navegación de módulos */}
            <nav className="space-y-2">
              {Object.entries(SYSTEM_MODULES).map(([moduleKey, module]) => {
                const hasAccess = canAccessModule(moduleKey, currentRole);
                const isExpanded = expandedModules.includes(moduleKey);
                const Icon = module.icon;
                const isDashboardActive = location === `/admin-roles/dashboard/${moduleKey.toLowerCase().replace(/\s+/g, '-')}`;

                if (!hasAccess) return null;

                return (
                  <div key={moduleKey} className="space-y-1">
                    {/* Módulo principal */}
                    <div className="flex items-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleModule(moduleKey)}
                        className={`flex-1 justify-start gap-2 ${isDashboardActive ? 'bg-gray-100' : ''}`}
                      >
                        <Icon className={`h-4 w-4 ${module.color}`} />
                        <span className="text-sm">{moduleKey}</span>
                        {isExpanded ? (
                          <ChevronDown className="h-3 w-3 ml-auto" />
                        ) : (
                          <ChevronRight className="h-3 w-3 ml-auto" />
                        )}
                      </Button>
                    </div>

                    {/* Dashboard y submódulos */}
                    {isExpanded && (
                      <div className="ml-4 space-y-1">
                        {/* Dashboard del módulo */}
                        <Link href={`/admin-roles/dashboard/${moduleKey.toLowerCase().replace(/\s+/g, '-')}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`w-full justify-start gap-2 text-xs ${
                              isDashboardActive ? 'bg-blue-50 text-blue-700' : ''
                            }`}
                          >
                            <Home className="h-3 w-3" />
                            Dashboard
                          </Button>
                        </Link>

                        {/* Submódulos */}
                        {module.submodules.map(submodule => {
                          const SubIcon = submodule.icon;
                          const isActive = location === submodule.path;
                          
                          return (
                            <Link key={submodule.path} href={submodule.path}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className={`w-full justify-start gap-2 text-xs ${
                                  isActive ? 'bg-blue-50 text-blue-700' : ''
                                }`}
                              >
                                <SubIcon className="h-3 w-3" />
                                {submodule.name}
                              </Button>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Contenido principal */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default DynamicAdminLayout;