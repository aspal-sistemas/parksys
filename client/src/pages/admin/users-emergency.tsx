import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader, Search, Plus, User, Edit, Trash2 } from 'lucide-react';

interface UserData {
  id: number;
  username: string;
  email: string;
  role: string;
  fullName: string;
  phone?: string;
  profileImageUrl?: string;
  createdAt: string;
}

const EmergencyUsers = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    console.log('🚨 [EMERGENCY] Iniciando componente de emergencia - users-emergency.tsx');
    
    const loadUsers = async () => {
      try {
        console.log('🚨 [EMERGENCY] Probando endpoint directo /api/users-direct');
        const response = await fetch('/api/users-direct', {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('🚨 [EMERGENCY] ¡ÉXITO! Usuarios cargados:', data.length);
          setUsers(Array.isArray(data) ? data : []);
          setError(null);
        } else {
          console.log('🚨 [EMERGENCY] Error respuesta:', response.status);
          
          // Fallback a endpoint normal
          console.log('🚨 [EMERGENCY] Probando fallback /api/users');
          const fallbackResponse = await fetch('/api/users');
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            console.log('🚨 [EMERGENCY] Fallback exitoso:', fallbackData.length);
            setUsers(Array.isArray(fallbackData) ? fallbackData : []);
            setError(null);
          } else {
            setError('Error del servidor en ambos endpoints');
          }
        }
      } catch (err) {
        console.error('🚨 [EMERGENCY] Error fetch:', err);
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
      case 'concesionario': return 'bg-green-100 text-green-800';
      case 'instructor': return 'bg-purple-100 text-purple-800';
      case 'voluntario': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredUsers = users.filter(user =>
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-8 text-center">
          <Loader className="mx-auto h-8 w-8 animate-spin" />
          <p className="mt-2 text-gray-600">🚨 Cargando usuarios (componente de emergencia)...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="p-8 text-center">
          <div className="text-red-600 mb-4">
            <p className="font-semibold">🚨 Error: {error}</p>
            <p className="text-sm">Componente users-emergency.tsx</p>
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
            <h1 className="text-3xl font-bold tracking-tight">🚨 Gestión de Usuarios (EMERGENCIA)</h1>
            <p className="text-muted-foreground">
              Sistema de emergencia para resolver problemas críticos de Replit
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Usuario
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Usuarios del Sistema ({filteredUsers.length})
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <Input
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      {user.profileImageUrl ? (
                        <img
                          src={user.profileImageUrl}
                          alt={user.fullName || user.username}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold">{user.fullName || user.username}</h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      {user.phone && (
                        <p className="text-sm text-gray-500">{user.phone}</p>
                      )}
                    </div>
                    <Badge className={getRoleBadgeColor(user.role)}>
                      {user.role}
                    </Badge>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {filteredUsers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  🚨 No hay usuarios disponibles
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default EmergencyUsers;