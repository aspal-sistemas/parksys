import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, Plus, Search, Edit, Trash2, Users, 
  Settings, Eye, Copy, MoreHorizontal,
  Crown, Star, Zap, Award, Gem
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';

// Tipos para roles
interface Role {
  id: string;
  name: string;
  displayName: string;
  description: string;
  level: number;
  userCount: number;
  permissions: number;
  isActive: boolean;
  createdAt: string;
  lastModified: string;
  badge: {
    color: string;
    textColor: string;
    icon: React.ReactNode;
  };
}

// Datos simulados de roles para desarrollo
const mockRoles: Role[] = [
  {
    id: 'super-admin',
    name: 'super-admin',
    displayName: 'Super Administrador',
    description: 'Control total del sistema para la gestión de parques y usuarios',
    level: 10,
    userCount: 2,
    permissions: 147,
    isActive: true,
    createdAt: '2024-01-15',
    lastModified: '2024-08-01',
    badge: { 
      color: 'bg-red-500', 
      textColor: 'text-white',
      icon: <Crown className="w-3 h-3" />
    }
  },
  {
    id: 'director-general',
    name: 'director-general',
    displayName: 'Director General',
    description: 'Visión estratégica y supervisión de operaciones',
    level: 9,
    userCount: 1,
    permissions: 89,
    isActive: true,
    createdAt: '2024-01-15',
    lastModified: '2024-07-28',
    badge: { 
      color: 'bg-purple-500', 
      textColor: 'text-white',
      icon: <Star className="w-3 h-3" />
    }
  },
  {
    id: 'coordinador-parques',
    name: 'coordinador-parques',
    displayName: 'Coordinador de Parques',
    description: 'Gestión integral de parques y espacios verdes',
    level: 8,
    userCount: 5,
    permissions: 65,
    isActive: true,
    createdAt: '2024-01-20',
    lastModified: '2024-08-03',
    badge: { 
      color: 'bg-green-500', 
      textColor: 'text-white',
      icon: <Gem className="w-3 h-3" />
    }
  },
  {
    id: 'coordinador-actividades',
    name: 'coordinador-actividades',
    displayName: 'Coordinador de Actividades',
    description: 'Gestión de actividades, eventos e instructores',
    level: 7,
    userCount: 3,
    permissions: 58,
    isActive: true,
    createdAt: '2024-01-25',
    lastModified: '2024-07-30',
    badge: { 
      color: 'bg-blue-500', 
      textColor: 'text-white',
      icon: <Zap className="w-3 h-3" />
    }
  },
  {
    id: 'operador-parque',
    name: 'operador-parque',
    displayName: 'Operador de Parque',
    description: 'Personal de campo para operaciones diarias',
    level: 4,
    userCount: 15,
    permissions: 32,
    isActive: true,
    createdAt: '2024-02-01',
    lastModified: '2024-08-02',
    badge: { 
      color: 'bg-orange-500', 
      textColor: 'text-white',
      icon: <Award className="w-3 h-3" />
    }
  },
  {
    id: 'admin-financiero',
    name: 'admin-financiero',
    displayName: 'Administrador Financiero',
    description: 'Gestión económica y contable',
    level: 6,
    userCount: 2,
    permissions: 45,
    isActive: true,
    createdAt: '2024-02-05',
    lastModified: '2024-07-25',
    badge: { 
      color: 'bg-yellow-500', 
      textColor: 'text-white',
      icon: <Shield className="w-3 h-3" />
    }
  },
  {
    id: 'consultor-auditor',
    name: 'consultor-auditor',
    displayName: 'Consultor/Auditor',
    description: 'Acceso de solo lectura para análisis',
    level: 1,
    userCount: 4,
    permissions: 28,
    isActive: true,
    createdAt: '2024-02-10',
    lastModified: '2024-07-20',
    badge: { 
      color: 'bg-gray-500', 
      textColor: 'text-white',
      icon: <Eye className="w-3 h-3" />
    }
  }
];

export default function RolesManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query para obtener roles (simulado)
  const { data: roles = mockRoles, isLoading } = useQuery<Role[]>({
    queryKey: ['/api/admin-roles/roles'],
    enabled: false // Deshabilitado para usar datos mock
  });

  // Mutation para eliminar rol
  const deleteRoleMutation = useMutation({
    mutationFn: async (roleId: string) => {
      // Simulación de eliminación
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (roleId === 'super-admin') {
        throw new Error('No se puede eliminar el rol Super Administrador');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin-roles/roles'] });
      toast({
        title: "Rol eliminado",
        description: "El rol se ha eliminado correctamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al eliminar",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutation para duplicar rol
  const duplicateRoleMutation = useMutation({
    mutationFn: async (roleId: string) => {
      await new Promise(resolve => setTimeout(resolve, 800));
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin-roles/roles'] });
      toast({
        title: "Rol duplicado",
        description: "El rol se ha duplicado correctamente.",
      });
    }
  });

  // Filtrar roles por búsqueda
  const filteredRoles = (roles as Role[]).filter((role: Role) =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteRole = (roleId: string, roleName: string) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar el rol "${roleName}"?`)) {
      deleteRoleMutation.mutate(roleId);
    }
  };

  const handleDuplicateRole = (roleId: string) => {
    duplicateRoleMutation.mutate(roleId);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Gestión de Roles
            </h1>
            <p className="text-gray-600 mt-2">
              Administrar roles del sistema y sus permisos
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/admin-roles/roles/templates">
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Plantillas
              </Button>
            </Link>
            <Link href="/admin-roles/roles/create">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Crear Rol
              </Button>
            </Link>
          </div>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar roles por nombre o descripción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Badge variant="outline" className="px-3 py-1">
                {filteredRoles.length} roles encontrados
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Roles Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Roles del Sistema
            </CardTitle>
            <CardDescription>
              Lista completa de roles con información de usuarios y permisos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rol</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Nivel</TableHead>
                  <TableHead>Usuarios</TableHead>
                  <TableHead>Permisos</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Última Modificación</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${role.badge.color} ${role.badge.textColor}`}>
                          {role.badge.icon}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{role.name.toUpperCase()}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-gray-600 max-w-xs">
                        {role.description}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        Nivel {role.level}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{role.userCount}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {role.permissions} permisos
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={role.isActive ? "default" : "secondary"}>
                        {role.isActive ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {new Date(role.lastModified).toLocaleDateString('es-ES')}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <Link href={`/admin-roles/roles/${role.id}`}>
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Detalles
                            </DropdownMenuItem>
                          </Link>
                          <Link href={`/admin-roles/roles/${role.id}/edit`}>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                          </Link>
                          <Link href={`/admin-roles/roles/${role.id}/permissions`}>
                            <DropdownMenuItem>
                              <Settings className="h-4 w-4 mr-2" />
                              Permisos
                            </DropdownMenuItem>
                          </Link>
                          <DropdownMenuItem onClick={() => handleDuplicateRole(role.id)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteRole(role.id, role.name)}
                            className="text-red-600"
                            disabled={role.id === 'super-admin'}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Roles</p>
                  <p className="text-3xl font-bold text-gray-900">{(roles as Role[]).length}</p>
                </div>
                <Shield className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Usuarios con Roles</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {(roles as Role[]).reduce((sum: number, role: Role) => sum + role.userCount, 0)}
                  </p>
                </div>
                <Users className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Permisos Totales</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {Math.max(...(roles as Role[]).map((role: Role) => role.permissions))}
                  </p>
                </div>
                <Settings className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}