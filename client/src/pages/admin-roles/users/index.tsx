import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Users, Search, Filter, UserPlus, UserCheck,
  Crown, Star, Gem, Zap, Award, Shield, Eye,
  Settings, MoreHorizontal, Edit, Trash2
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';

// Tipos para usuarios y roles
interface UserRole {
  id: string;
  name: string;
  displayName: string;
  level: number;
  badge: {
    color: string;
    icon: React.ReactNode;
  };
}

interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  createdAt: string;
  lastLogin: string;
  roles: UserRole[];
  department?: string;
  position?: string;
}

// Datos simulados de roles
const mockRoles: UserRole[] = [
  {
    id: 'super-admin',
    name: 'super-admin',
    displayName: 'Super Administrador',
    level: 10,
    badge: { color: 'bg-red-500', icon: <Crown className="w-3 h-3" /> }
  },
  {
    id: 'director-general',
    name: 'director-general',
    displayName: 'Director General',
    level: 9,
    badge: { color: 'bg-purple-500', icon: <Star className="w-3 h-3" /> }
  },
  {
    id: 'coordinador-parques',
    name: 'coordinador-parques',
    displayName: 'Coordinador de Parques',
    level: 8,
    badge: { color: 'bg-green-500', icon: <Gem className="w-3 h-3" /> }
  },
  {
    id: 'coordinador-actividades',
    name: 'coordinador-actividades',
    displayName: 'Coordinador de Actividades',
    level: 7,
    badge: { color: 'bg-blue-500', icon: <Zap className="w-3 h-3" /> }
  },
  {
    id: 'operador-parque',
    name: 'operador-parque',
    displayName: 'Operador de Parque',
    level: 4,
    badge: { color: 'bg-orange-500', icon: <Award className="w-3 h-3" /> }
  },
  {
    id: 'admin-financiero',
    name: 'admin-financiero',
    displayName: 'Administrador Financiero',
    level: 6,
    badge: { color: 'bg-yellow-500', icon: <Settings className="w-3 h-3" /> }
  },
  {
    id: 'consultor-auditor',
    name: 'consultor-auditor',
    displayName: 'Consultor/Auditor',
    level: 1,
    badge: { color: 'bg-gray-500', icon: <Eye className="w-3 h-3" /> }
  }
];

// Datos simulados de usuarios
const mockUsers: User[] = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@parksys.com',
    firstName: 'Administrador',
    lastName: 'Sistema',
    isActive: true,
    createdAt: '2024-01-15',
    lastLogin: '2024-08-04T10:30:00Z',
    roles: [mockRoles[0]], // Super Admin
    department: 'IT',
    position: 'Administrador del Sistema'
  },
  {
    id: 2,
    username: 'director.martinez',
    email: 'director@parksys.com',
    firstName: 'Carlos',
    lastName: 'Martínez',
    isActive: true,
    createdAt: '2024-01-20',
    lastLogin: '2024-08-04T09:15:00Z',
    roles: [mockRoles[1]], // Director General
    department: 'Dirección',
    position: 'Director General'
  },
  {
    id: 3,
    username: 'coord.parques',
    email: 'parques@parksys.com',
    firstName: 'Ana',
    lastName: 'García',
    isActive: true,
    createdAt: '2024-02-01',
    lastLogin: '2024-08-03T16:45:00Z',
    roles: [mockRoles[2]], // Coordinador de Parques
    department: 'Operaciones',
    position: 'Coordinadora de Parques'
  },
  {
    id: 4,
    username: 'coord.actividades',
    email: 'actividades@parksys.com',
    firstName: 'Miguel',
    lastName: 'López',
    isActive: true,
    createdAt: '2024-02-10',
    lastLogin: '2024-08-04T08:20:00Z',
    roles: [mockRoles[3]], // Coordinador de Actividades
    department: 'Eventos',
    position: 'Coordinador de Actividades'
  },
  {
    id: 5,
    username: 'operador.juan',
    email: 'juan.operador@parksys.com',
    firstName: 'Juan',
    lastName: 'Rodríguez',
    isActive: true,
    createdAt: '2024-03-01',
    lastLogin: '2024-08-03T14:30:00Z',
    roles: [mockRoles[4]], // Operador
    department: 'Operaciones',
    position: 'Operador de Campo'
  },
  {
    id: 6,
    username: 'admin.finanzas',
    email: 'finanzas@parksys.com',
    firstName: 'María',
    lastName: 'Hernández',
    isActive: true,
    createdAt: '2024-02-15',
    lastLogin: '2024-08-04T11:00:00Z',
    roles: [mockRoles[5]], // Admin Financiero
    department: 'Finanzas',
    position: 'Administradora Financiera'
  },
  {
    id: 7,
    username: 'consultor.ext',
    email: 'consultor@external.com',
    firstName: 'Roberto',
    lastName: 'Sánchez',
    isActive: true,
    createdAt: '2024-03-15',
    lastLogin: '2024-08-02T13:15:00Z',
    roles: [mockRoles[6]], // Consultor
    department: 'Externo',
    position: 'Consultor Externo'
  },
  {
    id: 8,
    username: 'operador.maria',
    email: 'maria.operador@parksys.com',
    firstName: 'María Elena',
    lastName: 'Torres',
    isActive: false,
    createdAt: '2024-03-20',
    lastLogin: '2024-07-28T16:00:00Z',
    roles: [mockRoles[4]], // Operador
    department: 'Operaciones',
    position: 'Operadora de Campo'
  }
];

export default function UsersManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query para obtener usuarios (simulado)
  const { data: users = mockUsers, isLoading } = useQuery({
    queryKey: ['/api/admin-roles/users'],
    enabled: false // Deshabilitado para usar datos mock
  });

  // Mutation para cambiar estado de usuario
  const toggleUserStatusMutation = useMutation({
    mutationFn: async ({ userId, newStatus }: { userId: number; newStatus: boolean }) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin-roles/users'] });
      toast({
        title: "Estado actualizado",
        description: "El estado del usuario se ha actualizado correctamente.",
      });
    }
  });

  // Filtrar usuarios
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.roles.some(role => role.id === roleFilter);
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && user.isActive) ||
                         (statusFilter === 'inactive' && !user.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleToggleUserStatus = (userId: number, currentStatus: boolean) => {
    toggleUserStatusMutation.mutate({ userId, newStatus: !currentStatus });
  };

  const formatLastLogin = (lastLogin: string) => {
    const date = new Date(lastLogin);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Hace menos de 1 hora';
    if (diffInHours < 24) return `Hace ${diffInHours} horas`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `Hace ${diffInDays} días`;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Gestión de Usuarios y Roles
            </h1>
            <p className="text-gray-600 mt-2">
              Administrar usuarios y asignar roles del sistema
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/admin-roles/users/bulk-assign">
              <Button variant="outline">
                <UserCheck className="w-4 h-4 mr-2" />
                Asignación Masiva
              </Button>
            </Link>
            <Link href="/admin-roles/users/create">
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Crear Usuario
              </Button>
            </Link>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
                  <p className="text-3xl font-bold text-gray-900">{users.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Usuarios Activos</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {users.filter(u => u.isActive).length}
                  </p>
                </div>
                <UserCheck className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Con Roles Asignados</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {users.filter(u => u.roles.length > 0).length}
                  </p>
                </div>
                <Shield className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Sin Roles</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {users.filter(u => u.roles.length === 0).length}
                  </p>
                </div>
                <Eye className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros y búsqueda */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar usuarios por nombre, email o usuario..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Filtrar por rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los roles</SelectItem>
                  {mockRoles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg ${role.badge.color} text-white text-xs`}>
                        {role.badge.icon}
                        <span>{role.name.toUpperCase()}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="active">Activos</SelectItem>
                  <SelectItem value="inactive">Inactivos</SelectItem>
                </SelectContent>
              </Select>

              <Badge variant="outline" className="self-center px-3 py-1">
                {filteredUsers.length} usuarios encontrados
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de usuarios */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Usuarios del Sistema
            </CardTitle>
            <CardDescription>
              Lista completa de usuarios con sus roles asignados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Departamento</TableHead>
                  <TableHead>Roles Asignados</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Último Acceso</TableHead>
                  <TableHead>Fecha Creación</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <p className="text-xs text-gray-500">@{user.username}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{user.department}</p>
                        <p className="text-sm text-gray-600">{user.position}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.roles.length > 0 ? (
                          user.roles.map((role) => (
                            <div key={role.id} className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg ${role.badge.color} text-white text-xs`}>
                              {role.badge.icon}
                              <span>{role.name.toUpperCase()}</span>
                            </div>
                          ))
                        ) : (
                          <Badge variant="outline" className="text-gray-500">
                            Sin roles
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? "default" : "secondary"}>
                        {user.isActive ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {formatLastLogin(user.lastLogin)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString('es-ES')}
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
                          <Link href={`/admin-roles/users/${user.id}/roles`}>
                            <DropdownMenuItem>
                              <UserCheck className="h-4 w-4 mr-2" />
                              Gestionar Roles
                            </DropdownMenuItem>
                          </Link>
                          <Link href={`/admin-roles/users/${user.id}/edit`}>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar Usuario
                            </DropdownMenuItem>
                          </Link>
                          <Link href={`/admin-roles/users/${user.id}/history`}>
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Historial
                            </DropdownMenuItem>
                          </Link>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                          >
                            <Settings className="h-4 w-4 mr-2" />
                            {user.isActive ? 'Desactivar' : 'Activar'}
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
      </div>
    </AdminLayout>
  );
}