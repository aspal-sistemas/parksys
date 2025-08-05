import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';

import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Save, User, Building, CheckCircle2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { queryClient } from '@/lib/queryClient';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();
};

const getRoleBadgeColor = (role: string) => {
  const roleColors: Record<string, string> = {
    'admin': 'bg-red-100 text-red-800',
    'supervisor': 'bg-blue-100 text-blue-800',
    'tecnico': 'bg-green-100 text-green-800',
    'responsable': 'bg-purple-100 text-purple-800',
    'gerente': 'bg-yellow-100 text-yellow-800'
  };
  return roleColors[role] || 'bg-gray-100 text-gray-800';
};

const getRoleLabel = (role: string) => {
  const roleLabels: Record<string, string> = {
    'admin': 'Administrador',
    'supervisor': 'Supervisor',
    'tecnico': 'Técnico',
    'responsable': 'Responsable',
    'gerente': 'Gerente'
  };
  return roleLabels[role] || role;
};

const AssignAssetManagerPage = () => {
  const [_, setLocation] = useLocation();
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Obtener lista de activos
  const { data: assets = [] } = useQuery({
    queryKey: ['/api/assets'],
    retry: false,
  });

  // Obtener lista de usuarios que pueden ser administradores de activos
  const { data: users = [] } = useQuery({
    queryKey: ['/api/users'],
    retry: false,
  });

  // Lista filtrada de usuarios relevantes (roles de administración)
  const relevantUsers = Array.isArray(users) ? users.filter((user: any) => 
    ['admin', 'supervisor', 'gerente', 'responsable'].includes(user.role)
  ) : [];

  // Datos de muestra para activos en caso de que falle la conexión a la API
  const sampleAssets = [
    { id: 1, name: 'Banca Modelo Colonial', parkId: 1, parkName: 'Parque Central', managerId: null },
    { id: 2, name: 'Juego Infantil Múltiple', parkId: 1, parkName: 'Parque Central', managerId: null },
    { id: 3, name: 'Fuente Central', parkId: 2, parkName: 'Parque Metropolitano', managerId: null },
    { id: 4, name: 'Señalización Informativa', parkId: 2, parkName: 'Parque Metropolitano', managerId: null },
  ];

  // Datos de muestra para usuarios en caso de que falle la conexión a la API
  const sampleUsers = [
    { id: 1, fullName: 'Juan Pérez', role: 'admin', profileImageUrl: null },
    { id: 2, fullName: 'María López', role: 'supervisor', profileImageUrl: null },
    { id: 3, fullName: 'Carlos Gómez', role: 'gerente', profileImageUrl: null },
  ];

  // Determinar qué datos utilizar (API o muestra)
  const displayAssets = Array.isArray(assets) && assets.length > 0 ? assets : sampleAssets;
  const displayUsers = relevantUsers.length > 0 ? relevantUsers : sampleUsers;

  // Obtener el activo seleccionado
  const selectedAsset = displayAssets.find((asset: any) => asset.id.toString() === selectedAssetId);
  
  // Obtener el usuario que ya está asignado como responsable, si existe
  const currentManager = selectedAsset?.managerId 
    ? displayUsers.find((user: any) => user.id.toString() === selectedAsset.managerId.toString())
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAssetId) {
      toast({
        title: 'Error',
        description: 'Debes seleccionar un activo para asignar un responsable',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedUserId) {
      toast({
        title: 'Error',
        description: 'Debes seleccionar un usuario como responsable',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    try {
      // Preparar los datos para el envío
      const assignmentData = {
        assetId: parseInt(selectedAssetId),
        managerId: parseInt(selectedUserId)
      };

      // Intentar enviar los datos a la API
      const response = await fetch(`/api/assets/${selectedAssetId}/assign-manager`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(assignmentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al asignar responsable');
      }

      // Invalidar consultas relacionadas para actualizar los datos
      queryClient.invalidateQueries({
        queryKey: ['/api/assets'],
      });
      
      toast({
        title: 'Responsable asignado',
        description: 'El responsable ha sido asignado correctamente al activo',
      });

      // Redirigir a la lista de activos
      setLocation('/admin/assets');
    } catch (error) {
      console.error('Error al asignar responsable:', error);
      toast({
        title: 'Error',
        description: 'No se pudo asignar el responsable. Por favor, intenta de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="container py-6">
        <div className="mb-6 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => setLocation('/admin/assets')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Activos
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Asignar Responsable</h1>
              <p className="text-muted-foreground">
                Asigna un usuario responsable para la gestión de activos
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Seleccionar Activo</CardTitle>
                <CardDescription>
                  Elige el activo al que deseas asignar un responsable
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="asset">Activo*</Label>
                  <Select 
                    value={selectedAssetId} 
                    onValueChange={(value) => {
                      setSelectedAssetId(value);
                      const asset = displayAssets.find((a: any) => a.id.toString() === value);
                      if (asset && asset.managerId) {
                        setSelectedUserId(asset.managerId.toString());
                      } else {
                        setSelectedUserId('');
                      }
                    }}
                    required
                  >
                    <SelectTrigger id="asset">
                      <SelectValue placeholder="Selecciona un activo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {displayAssets.map((asset: any) => (
                          <SelectItem key={asset.id} value={asset.id.toString()}>
                            {asset.name} ({asset.parkName || 'Sin parque asignado'})
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                {selectedAssetId && (
                  <div className="border rounded-md p-4 bg-slate-50">
                    <h3 className="font-medium mb-2">Información del activo</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Nombre:</span>
                        <span className="text-sm font-medium">{selectedAsset?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Parque:</span>
                        <span className="text-sm font-medium">{selectedAsset?.parkName || 'No asignado'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Responsable actual:</span>
                        <span className="text-sm font-medium">
                          {currentManager ? (
                            <span className="flex items-center">
                              <span className="mr-1">{currentManager.fullName}</span>
                              <Badge variant="outline" className={getRoleBadgeColor(currentManager.role)}>
                                {getRoleLabel(currentManager.role)}
                              </Badge>
                            </span>
                          ) : (
                            'No asignado'
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Seleccionar Responsable</CardTitle>
                <CardDescription>
                  Elige el usuario que será responsable del activo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="manager">Responsable*</Label>
                  <Select value={selectedUserId} onValueChange={setSelectedUserId} required>
                    <SelectTrigger id="manager">
                      <SelectValue placeholder="Selecciona un responsable" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {displayUsers.map((user: any) => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            {user.fullName} ({getRoleLabel(user.role)})
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                {selectedUserId && (
                  <div className="grid gap-4">
                    {displayUsers.filter((user: any) => user.id.toString() === selectedUserId).map((user: any) => (
                      <div key={user.id} className="flex items-start space-x-4 p-4 border rounded-md">
                        <Avatar className="h-12 w-12">
                          {user.profileImageUrl ? (
                            <AvatarImage src={user.profileImageUrl} alt={user.fullName} />
                          ) : (
                            <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
                          )}
                        </Avatar>
                        <div className="space-y-1">
                          <h4 className="font-medium">{user.fullName}</h4>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className={getRoleBadgeColor(user.role)}>
                              {getRoleLabel(user.role)}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{user.email}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Este usuario tendrá permisos para gestionar este activo, 
                            programar mantenimientos y actualizar su estado.
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 flex justify-end">
            <Button variant="outline" type="button" className="mr-2" onClick={() => setLocation('/admin/assets')}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              <Save className="mr-2 h-4 w-4" />
              {submitting ? 'Guardando...' : 'Asignar Responsable'}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AssignAssetManagerPage;