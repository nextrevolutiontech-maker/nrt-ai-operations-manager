import { useAuthStore } from '../../hooks/useAuth';
import { Bell, UserCircle, Menu } from 'lucide-react';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all duration-300">
      <div className="flex items-center flex-1 gap-4">
        {onMenuClick && (
          <button 
            onClick={onMenuClick}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg lg:hidden focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <span className="hidden sm:inline-block text-sm font-medium text-slate-500">Dashboard / Welcome</span>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-4">
        <Link href="/notifications" className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </Link>
        
        <div className="flex items-center gap-3 pl-2 sm:pl-4 border-l border-slate-200">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-sm font-semibold text-slate-900 leading-tight">
              {mounted ? `${user?.firstName || ''} ${user?.lastName || ''}` : '...'}
            </span>
            <span className="text-xs text-slate-500">
              {mounted ? user?.email : '...'}
            </span>
          </div>
          <button className="p-1 rounded-full text-slate-400 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500">
            <UserCircle className="w-8 h-8" />
          </button>
        </div>
      </div>
    </header>
  );
}
