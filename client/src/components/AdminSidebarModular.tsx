import React, { useState } from "react";
import { useLocation } from "wouter";
import { 
  ChevronDown, 
  ChevronRight, 
  Database, 
  FileText, 
  Home, 
  Map, 
  MessageSquare, 
  Settings, 
  User, 
  Users, 
  Landmark, 
  Activity,
  AlertTriangle,
  BarChart,
  Calendar,
  Shield,
  Heart,
  Package,
  Clock,
  FileQuestion,
  Wrench,
  Menu,
  X
} from "lucide-react";
// Utilizamos un div con texto como logo temporal
const Logo = () => (
  <div className="text-xl font-bold text-blue-600">ParquesMX</div>
);
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

// Componente de enlace para el sidebar
interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ 
  href, 
  icon, 
  children, 
  active = false,
  onClick
}) => {
  const [_, setLocation] = useLocation();
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onClick) {
      onClick();
    } else {
      setLocation(href);
    }
  };
  
  return (
    <a
      href={href}
      onClick={handleClick}
      className={cn(
        "flex items-center space-x-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md px-3 py-2 transition-colors",
        active && "bg-blue-50 text-blue-600 font-medium"
      )}
    >
      <span className="flex-shrink-0 w-5 h-5">{icon}</span>
      <span className="flex-1 truncate">{children}</span>
    </a>
  );
};

// Componente de grupo de enlaces con submenú
interface SidebarGroupProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  active?: boolean;
}

const SidebarGroup: React.FC<SidebarGroupProps> = ({ 
  title, 
  icon, 
  children, 
  defaultOpen = false,
  active = false 
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen || active);
  
  return (
    <div className="mb-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between w-full text-left text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md px-3 py-2 transition-colors",
          active && "bg-blue-50 text-blue-600 font-medium"
        )}
      >
        <div className="flex items-center space-x-3">
          <span className="flex-shrink-0 w-5 h-5">{icon}</span>
          <span className="flex-1 truncate">{title}</span>
        </div>
        <span className="flex-shrink-0">
          {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </span>
      </button>
      
      {isOpen && (
        <div className="pl-10 mt-1 space-y-1">{children}</div>
      )}
    </div>
  );
};

// Componente principal del sidebar
interface AdminSidebarProps {
  currentPath: string;
  onCloseMobileMenu?: () => void;
}

const AdminSidebarModular: React.FC<AdminSidebarProps> = ({ 
  currentPath,
  onCloseMobileMenu
}) => {
  // Verifica si una ruta está activa
  const isActive = (path: string) => {
    if (path === "/admin" && currentPath === "/admin") {
      return true;
    }
    if (path !== "/admin" && currentPath.startsWith(path)) {
      return true;
    }
    return false;
  };
  
  // Verifica si una ruta de grupo está activa
  const isGroupActive = (paths: string[]) => {
    return paths.some(path => currentPath.startsWith(path));
  };
  
  return (
    <aside className="h-full flex flex-col bg-white border-r border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <Logo />
          {onCloseMobileMenu && (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={onCloseMobileMenu}
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
      
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        <SidebarLink 
          href="/admin" 
          icon={<Home />} 
          active={currentPath === "/admin"}
        >
          Dashboard
        </SidebarLink>
        
        <SidebarLink 
          href="/admin/parks" 
          icon={<Landmark />} 
          active={isActive("/admin/parks")}
        >
          Parques
        </SidebarLink>
        
        <SidebarGroup 
          title="Operaciones" 
          icon={<Activity />}
          defaultOpen={true}
          active={isGroupActive([
            "/admin/organizador", 
            "/admin/activities",
            "/admin/incidents",
            "/admin/amenities"
          ])}
        >
          <SidebarLink 
            href="/admin/organizador" 
            active={isActive("/admin/organizador")}
          >
            Actividades
          </SidebarLink>
          
          <SidebarLink 
            href="/admin/activities/calendar" 
            active={isActive("/admin/activities/calendar")}
          >
            Calendario
          </SidebarLink>
          
          <SidebarLink 
            href="/admin/incidents" 
            active={isActive("/admin/incidents")}
          >
            Incidencias
          </SidebarLink>
          
          <SidebarLink 
            href="/admin/dashboard-incidencias" 
            active={isActive("/admin/dashboard-incidencias")}
          >
            <span className="flex items-center font-bold text-red-600">
              <BarChart className="h-4 w-4 mr-2" />
              Dashboard Incidencias
            </span>
          </SidebarLink>
          
          <SidebarLink 
            href="/admin/amenities" 
            active={isActive("/admin/amenities")}
          >
            Amenidades
          </SidebarLink>
        </SidebarGroup>
        
        <SidebarGroup 
          title="Personas" 
          icon={<Users />}
          active={isGroupActive([
            "/admin/volunteers", 
            "/admin/instructors"
          ])}
        >
          <SidebarLink 
            href="/admin/volunteers" 
            active={isActive("/admin/volunteers")}
          >
            Voluntarios
          </SidebarLink>
          
          <SidebarLink 
            href="/admin/instructors" 
            active={isActive("/admin/instructors")}
          >
            Instructores
          </SidebarLink>
        </SidebarGroup>
        
        <SidebarGroup 
          title="Usuarios" 
          icon={<User />}
          active={isGroupActive([
            "/admin/users", 
            "/admin/permissions"
          ])}
        >
          <SidebarLink 
            href="/admin/users" 
            active={isActive("/admin/users")}
          >
            Lista de Usuarios
          </SidebarLink>
          
          <SidebarLink 
            href="/admin/permissions" 
            active={isActive("/admin/permissions")}
          >
            Permisos de Roles
          </SidebarLink>
        </SidebarGroup>
        
        <SidebarLink 
          href="/admin/assets" 
          icon={<Package />} 
          active={isActive("/admin/assets")}
        >
          Activos
        </SidebarLink>
        
        <SidebarLink 
          href="/admin/documents" 
          icon={<FileText />} 
          active={isActive("/admin/documents")}
        >
          Documentos
        </SidebarLink>
        
        <SidebarLink 
          href="/admin/comments" 
          icon={<MessageSquare />} 
          active={isActive("/admin/comments")}
        >
          Comentarios
        </SidebarLink>
        
        <SidebarLink 
          href="/admin/analytics" 
          icon={<BarChart />} 
          active={isActive("/admin/analytics")}
        >
          Analítica
        </SidebarLink>
        
        <SidebarLink 
          href="/admin/settings" 
          icon={<Settings />} 
          active={isActive("/admin/settings")}
        >
          Configuración
        </SidebarLink>
      </nav>
    </aside>
  );
};

export default AdminSidebarModular;