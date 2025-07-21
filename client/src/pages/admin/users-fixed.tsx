import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader, Plus, Search } from 'lucide-react';

type UserData = {
  id: number;
  username: string;
  email: string;
  role: string;
  fullName: string;
  profileImageUrl?: string;
};

const AdminUsersFixed = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🎯 [COMPONENTE FIJO] Iniciando carga - users-fixed.tsx');
    
    const loadUsers = async () => {
      try {
        console.log('🎯 [COMPONENTE FIJO] Probando /api/users-direct');
        const response = await fetch('/api/users-direct');
        
        if (response.ok) {
          const data = await response.json();
          console.log('🎯 [COMPONENTE FIJO] ¡ÉXITO! Usuarios cargados:', data);
          setUsers(data);
          setError(null);
        } else {
          console.log('🎯 [COMPONENTE FIJO] Error respuesta:', response.status);
          setError('Error del servidor');
        }
      } catch (err) {
        console.error('🎯 [COMPONENTE FIJO] Error fetch:', err);
        setError('Error de conectividad');
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, []);

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'gestor': return 'bg-blue-100 text-blue-800';
      case 'supervisor': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-8 text-center">
          <Loader className="mx-auto h-8 w-8 animate-spin" />
          <p className="mt-2 text-gray-600">🎯 Cargando usuarios (componente fijo)...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="p-8 text-center">
          <div className="text-red-600 mb-4">
            <p className="font-semibold">🎯 Error: {error}</p>
            <p className="text-sm">Componente users-fixed.tsx</p>
          </div>
          <Button onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">🎯 Gestión de Usuarios (FIJO)</h1>
            <p className="text-muted-foreground">
              Sistema reparado para resolver problemas de Replit
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Usuario
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Usuarios ({users.length}) - Componente users-fixed.tsx</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.profileImageUrl} alt={user.fullName} />
                      <AvatarFallback>
                        {user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{user.fullName}</h3>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <p className="text-sm text-muted-foreground">@{user.username}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getRoleBadgeColor(user.role)}>
                      {user.role}
                    </Badge>
                  </div>
                </div>
              ))}
              {users.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  🎯 No hay usuarios disponibles
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminUsersFixed;