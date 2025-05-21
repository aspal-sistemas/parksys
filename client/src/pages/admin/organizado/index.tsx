import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plus, Tag, Users, MapPin, Clock } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';

// Página principal del módulo de Organizado
const OrganizadoPage: React.FC = () => {
  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Organizado</h1>
          <p className="text-gray-500">Gestión de actividades y eventos en parques</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/organizado/nueva-actividad">
            <Button className="flex items-center gap-2">
              <Plus size={16} />
              Nueva Actividad
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Actividades Activas</h3>
              <p className="text-3xl font-bold mt-2">0</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Participantes Registrados</h3>
              <p className="text-3xl font-bold mt-2">0</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Categorías</h3>
              <p className="text-3xl font-bold mt-2">4</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Tag className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-8">
        <h2 className="text-xl font-semibold mb-4">Actividades Próximas</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Parque</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Duración</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                Aún no hay actividades programadas
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-4">Categorías de Actividades</h2>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                  Arte y Cultura
                </Badge>
              </div>
              <span className="text-sm text-gray-500">0 actividades</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                  Recreación y Bienestar
                </Badge>
              </div>
              <span className="text-sm text-gray-500">0 actividades</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
              <div className="flex items-center gap-2">
                <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
                  Eventos de Temporada
                </Badge>
              </div>
              <span className="text-sm text-gray-500">0 actividades</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
              <div className="flex items-center gap-2">
                <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                  Naturaleza, Ciencia y Conservación
                </Badge>
              </div>
              <span className="text-sm text-gray-500">0 actividades</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-4">Parques con Más Actividades</h2>
          <div className="space-y-2">
            <div className="flex items-center p-3 bg-gray-50 rounded-md">
              <div className="w-full">
                <div className="flex justify-between mb-2">
                  <span className="font-medium">No hay datos disponibles</span>
                  <span className="text-sm text-gray-500">0 actividades</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-primary h-2.5 rounded-full" style={{ width: '0%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default OrganizadoPage;