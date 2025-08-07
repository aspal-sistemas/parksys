import React from 'react';
import { Bell, Search, Settings, User, MessageSquare, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import UserProfileImage from '@/components/UserProfileImage';

const AdminHeader: React.FC = () => {
  const { user } = useAuth();

  return (
    <header 
      className="h-16 border-b border-gray-200 flex items-center justify-between px-6 shadow-sm"
      style={{ backgroundColor: '#D2EAEA' }}
    >
      {/* Left section - Search */}
      <div className="flex items-center flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Buscar en el sistema..."
            className="pl-10 bg-white/70 border-white/50 focus:bg-white focus:border-teal-300"
          />
        </div>
      </div>

      {/* Right section - Actions and User */}
      <div className="flex items-center gap-3">
        {/* Quick Action Icons */}
        <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800 hover:bg-white/50">
          <MessageSquare className="h-5 w-5" />
        </Button>
        
        <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800 hover:bg-white/50">
          <Bell className="h-5 w-5" />
        </Button>
        
        <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800 hover:bg-white/50">
          <HelpCircle className="h-5 w-5" />
        </Button>

        <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800 hover:bg-white/50">
          <Settings className="h-5 w-5" />
        </Button>

        {/* Separator */}
        <div className="h-6 w-px bg-gray-300" />

        {/* User Info */}
        <div className="flex items-center gap-2">
          <UserProfileImage 
            userId={(user as any)?.id || 0} 
            role={(user as any)?.role || 'user'} 
            name={(user as any)?.fullName || (user as any)?.username || 'Usuario'} 
            size="sm" 
          />
          <div className="hidden md:block">
            <p className="text-sm font-medium text-gray-800">
              {(user as any)?.firstName && (user as any)?.lastName 
                ? `${(user as any).firstName} ${(user as any).lastName}` 
                : (user as any)?.fullName || (user as any)?.username || 'Usuario'}
            </p>
            <p className="text-xs text-gray-600">{(user as any)?.role || 'usuario'}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;