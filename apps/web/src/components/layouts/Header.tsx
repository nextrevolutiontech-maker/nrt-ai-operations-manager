import { useAuthStore } from '../../hooks/useAuth';
import { Bell, UserCircle } from 'lucide-react';

export function Header() {
  const { user } = useAuthStore();

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between h-16 px-6 bg-white border-b shadow-sm">
      <div className="flex items-center flex-1">
        <span className="text-sm text-gray-500">Dashboard / Welcome</span>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <div className="flex items-center gap-3 pl-4 border-l">
          <div className="flex flex-col text-right">
            <span className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</span>
            <span className="text-xs text-gray-500">{user?.email}</span>
          </div>
          <UserCircle className="w-8 h-8 text-gray-400" />
        </div>
      </div>
    </header>
  );
}
