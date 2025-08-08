import AdminLayout from '@/components/AdminLayout';
import UsersManagement from '../componentes/UsersManagement';

export default function UserAssignments() {
  return (
    <AdminLayout 
      title="Asignación de Usuarios" 
      subtitle="Gestión de usuarios del sistema y asignación de roles"
    >
      <UsersManagement />
    </AdminLayout>
  );
}